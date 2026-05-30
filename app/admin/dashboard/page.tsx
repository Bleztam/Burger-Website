'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, ToggleLeft, ToggleRight, Loader2, DollarSign, MapPin, ClipboardList, Utensils, Image, RefreshCw } from 'lucide-react'

// TS Types
interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: 'burgers' | 'drinks'
  image_url: string
  is_active: boolean
}

interface Branch {
  id: number
  name: string
  address: string
  latitude: number
  longitude: number
  status: 'UNLOCKED' | 'LOCKED'
  step_order: number
  hours: string
}

interface OrderItem {
  id: string
  quantity: number
  menu_items: {
    name: string
    category: string
  }
}

interface Order {
  id: string
  customer_name: string
  customer_phone: string
  delivery_address: string
  total_amount: number
  status: 'PENDING' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED'
  created_at: string
  order_items: OrderItem[]
}

const statusWorkflow: Array<Order['status']> = ['PENDING', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED']

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'branches'>('orders')
  const supabase = createClient()

  // State Management
  const [orders, setOrders] = useState<Order[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [branches, setBranches] = useState<Branch[]>([])

  // Action loaders
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [loadingMenu, setLoadingMenu] = useState(true)
  const [loadingBranches, setLoadingBranches] = useState(true)

  // Forms state
  const [newMenu, setNewMenu] = useState({ name: '', description: '', price: '', category: 'burgers', imageFile: null as File | null })
  const [menuUploading, setMenuUploading] = useState(false)
  
  const [newBranch, setNewBranch] = useState({ name: '', address: '', latitude: '', longitude: '', step_order: '', hours: 'Mon-Sun: 5PM - 12AM' })
  const [branchSubmitting, setBranchSubmitting] = useState(false)

  // =========================================================================
  // 1. ORDERS DASHBOARD (Kanban + Realtime sync)
  // =========================================================================
  const fetchOrders = async () => {
    setLoadingOrders(true)
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, customer_name, customer_phone, delivery_address, total_amount, status, created_at,
        order_items(
          id, quantity,
          menu_items(name, category)
        )
      `)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setOrders(data as unknown as Order[])
    }
    setLoadingOrders(false)
  }

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders()

      // Bind Supabase Realtime channel to listen to orders updates and insertions
      const channel = supabase
        .channel('orders-realtime-console')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          () => {
            fetchOrders() // Reload full relational dataset upon order triggers
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [activeTab])

  const advanceOrderStatus = async (orderId: string, currentStatus: Order['status']) => {
    const currentIndex = statusWorkflow.indexOf(currentStatus)
    if (currentIndex === -1 || currentIndex === statusWorkflow.length - 1) return // Already delivered

    const nextStatus = statusWorkflow[currentIndex + 1]
    const { error } = await supabase
      .from('orders')
      .update({ status: nextStatus })
      .eq('id', orderId)

    if (!error) {
      // Optimistic state update in Kanban
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order))
      )
    }
  }

  // =========================================================================
  // 2. MENU MANAGER ACTIONS
  // =========================================================================
  const fetchMenu = async () => {
    setLoadingMenu(true)
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setMenuItems(data)
    }
    setLoadingMenu(false)
  }

  useEffect(() => {
    if (activeTab === 'menu') {
      fetchMenu()
    }
  }, [activeTab])

  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMenu.name || !newMenu.price) return
    setMenuUploading(true)

    try {
      let imageUrl = ''

      // Storage Bucket Upload Pipeline if file is selected
      if (newMenu.imageFile) {
        const file = newMenu.imageFile
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `menu-items/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('burger-images')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data } = supabase.storage
          .from('burger-images')
          .getPublicUrl(filePath)
        
        imageUrl = data.publicUrl
      }

      const { error } = await supabase
        .from('menu_items')
        .insert({
          name: newMenu.name,
          description: newMenu.description,
          price: parseFloat(newMenu.price),
          category: newMenu.category,
          image_url: imageUrl || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300',
          is_active: true,
        })

      if (!error) {
        setNewMenu({ name: '', description: '', price: '', category: 'burgers', imageFile: null })
        fetchMenu()
      }
    } catch (err: any) {
      alert(`Menu Upload Failed: ${err.message}`)
    } finally {
      setMenuUploading(false)
    }
  }

  const toggleMenuItem = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('menu_items')
      .update({ is_active: !currentStatus })
      .eq('id', id)

    if (!error) {
      setMenuItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_active: !currentStatus } : item))
      )
    }
  }

  const deleteMenuItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return

    const { error } = await supabase.from('menu_items').delete().eq('id', id)
    if (!error) {
      setMenuItems((prev) => prev.filter((item) => item.id !== id))
    }
  }

  // =========================================================================
  // 3. BRANCH MANAGER ACTIONS
  // =========================================================================
  const fetchBranches = async () => {
    setLoadingBranches(true)
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .order('step_order', { ascending: true })

    if (!error && data) {
      setBranches(data)
    }
    setLoadingBranches(false)
  }

  useEffect(() => {
    if (activeTab === 'branches') {
      fetchBranches()
    }
  }, [activeTab])

  const handleBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBranch.name || !newBranch.address || !newBranch.latitude || !newBranch.longitude || !newBranch.step_order) return
    setBranchSubmitting(true)

    const { error } = await supabase
      .from('branches')
      .insert({
        name: newBranch.name,
        address: newBranch.address,
        latitude: parseFloat(newBranch.latitude),
        longitude: parseFloat(newBranch.longitude),
        step_order: parseInt(newBranch.step_order),
        hours: newBranch.hours,
        status: 'UNLOCKED'
      })

    if (!error) {
      setNewBranch({ name: '', address: '', latitude: '', longitude: '', step_order: '', hours: 'Mon-Sun: 5PM - 12AM' })
      fetchBranches()
    }
    setBranchSubmitting(false)
  }

  const toggleBranchStatus = async (id: number, currentStatus: Branch['status']) => {
    const nextStatus = currentStatus === 'UNLOCKED' ? 'LOCKED' : 'UNLOCKED'
    const { error } = await supabase
      .from('branches')
      .update({ status: nextStatus })
      .eq('id', id)

    if (!error) {
      setBranches((prev) =>
        prev.map((branch) => (branch.id === id ? { ...branch, status: nextStatus } : branch))
      )
    }
  }

  return (
    <div>
      {/* Operating panel tabs header bar */}
      <div className="flex border-b border-neutral-850 mb-8 bg-neutral-900 rounded-xl p-1.5 max-w-md">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'orders' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <ClipboardList size={14} /> Orders
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'menu' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Utensils size={14} /> Menu
        </button>
        <button
          onClick={() => setActiveTab('branches')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'branches' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <MapPin size={14} /> Branches
        </button>
      </div>

      {/* =========================================================================
          TAB 1: LIVE ORDER CONSOLE (KANBAN STYLE)
          ========================================================================= */}
      {activeTab === 'orders' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl uppercase tracking-wider text-white">Live Orders Console</h2>
            <button
              onClick={fetchOrders}
              className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white cursor-pointer hover:rotate-180 transition-transform duration-300"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {loadingOrders ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="text-amber-500 animate-spin" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {statusWorkflow.map((colStatus) => {
                const columnOrders = orders.filter((order) => order.status === colStatus)
                return (
                  <div key={colStatus} className="bg-neutral-900/60 border border-neutral-850/60 rounded-2xl p-4 flex flex-col h-[70vh]">
                    <div className="flex justify-between items-center pb-3 border-b border-neutral-800/80 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
                        {colStatus.replace(/_/g, ' ')}
                      </span>
                      <span className="bg-neutral-950 px-2 py-0.5 rounded-full border border-neutral-800 text-[10px] font-bold text-neutral-400">
                        {columnOrders.length}
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                      {columnOrders.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-center p-4">
                          <p className="text-[10px] uppercase text-neutral-600 tracking-wider">No active orders</p>
                        </div>
                      ) : (
                        columnOrders.map((order) => (
                          <div
                            key={order.id}
                            className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 hover:border-amber-500/30 transition-colors shadow-md relative group"
                          >
                            <span className="text-[9px] font-mono text-neutral-550 block mb-1">
                              ID: #{order.id.slice(-6).toUpperCase()}
                            </span>
                            <h4 className="text-xs font-bold text-neutral-250 mb-2 truncate">
                              {order.customer_name}
                            </h4>
                            
                            {/* Ordered Items List */}
                            <ul className="space-y-1 mb-3 border-t border-neutral-900 pt-2 pb-1.5">
                              {order.order_items.map((item) => (
                                <li key={item.id} className="text-[10px] text-neutral-400 flex items-center justify-between">
                                  <span>{item.menu_items?.name || 'Item'}</span>
                                  <span className="font-bold text-neutral-300">x{item.quantity}</span>
                                </li>
                              ))}
                            </ul>

                            <p className="text-[10px] text-neutral-500 truncate mb-4">
                              📍 {order.delivery_address}
                            </p>

                            <div className="flex items-center justify-between pt-2 border-t border-neutral-900">
                              <span className="text-[10px] font-bold text-amber-500">
                                R$ {Number(order.total_amount).toFixed(2)}
                              </span>
                              {colStatus !== 'DELIVERED' && (
                                <button
                                  onClick={() => advanceOrderStatus(order.id, order.status)}
                                  className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                                >
                                  Advance state
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: MENU MANAGER
          ========================================================================= */}
      {activeTab === 'menu' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Uploader Form Column */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-900 border border-neutral-850 p-6 rounded-2xl shadow-xl sticky top-8">
              <h3 className="font-display text-xl uppercase tracking-wider text-neutral-200 mb-4 flex items-center gap-2">
                <Plus size={18} className="text-amber-500" /> Add Menu Item
              </h3>
              
              <form onSubmit={handleMenuSubmit} className="space-y-4">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newMenu.name}
                    onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })}
                    placeholder="E.g. Bacon Cheddar Melt"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Price (R$)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">
                      <DollarSign size={12} />
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newMenu.price}
                      onChange={(e) => setNewMenu({ ...newMenu, price: e.target.value })}
                      placeholder="38.00"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-4 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Category Type
                  </label>
                  <select
                    value={newMenu.category}
                    onChange={(e) => setNewMenu({ ...newMenu, category: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value="burgers">Burgers</option>
                    <option value="drinks">Drinks</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Item Description
                  </label>
                  <textarea
                    rows={3}
                    value={newMenu.description}
                    onChange={(e) => setNewMenu({ ...newMenu, description: e.target.value })}
                    placeholder="Brief description of patties, toppings, bun, or drink mix."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block mb-1 flex items-center gap-1">
                    <Image size={12} className="text-amber-500" /> Image File
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewMenu({ ...newMenu, imageFile: e.target.files?.[0] || null })}
                    className="w-full text-xs text-neutral-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-neutral-800 file:text-amber-500 file:hover:bg-neutral-750 cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  disabled={menuUploading}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold uppercase tracking-wider text-xs shadow-lg transition-transform duration-300 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer mt-6"
                >
                  {menuUploading ? 'Uploading & Creating...' : 'Create Menu Item'}
                </button>
              </form>
            </div>
          </div>

          {/* Menu Grid List Column */}
          <div className="lg:col-span-2">
            <h3 className="font-display text-xl uppercase tracking-wider text-neutral-200 mb-4">Live Menu Grid</h3>
            {loadingMenu ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="text-amber-500 animate-spin" size={32} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-neutral-900 border border-neutral-850 rounded-2xl flex gap-4 items-start"
                  >
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover bg-neutral-950 border border-neutral-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-sm font-bold text-neutral-200 truncate">{item.name}</h4>
                        <span className="text-xs font-bold text-amber-500 shrink-0">R$ {Number(item.price).toFixed(2)}</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-neutral-850">
                        <button
                          onClick={() => toggleMenuItem(item.id, item.is_active)}
                          className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold text-neutral-400 hover:text-white cursor-pointer"
                        >
                          {item.is_active ? (
                            <><ToggleRight className="text-green-500" size={16} /> Active</>
                          ) : (
                            <><ToggleLeft className="text-neutral-600" size={16} /> Inactive</>
                          )}
                        </button>

                        <button
                          onClick={() => deleteMenuItem(item.id)}
                          className="p-1 rounded bg-red-600/10 hover:bg-red-600/20 text-red-500 transition-colors border border-red-500/15 cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: BRANCH MANAGER
          ========================================================================= */}
      {activeTab === 'branches' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Branch Form */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-900 border border-neutral-850 p-6 rounded-2xl shadow-xl sticky top-8">
              <h3 className="font-display text-xl uppercase tracking-wider text-neutral-200 mb-4 flex items-center gap-2">
                <Plus size={18} className="text-amber-500" /> Create Branch Node
              </h3>
              
              <form onSubmit={handleBranchSubmit} className="space-y-4">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newBranch.name}
                    onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                    placeholder="E.g. Batel"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Node Step Order (Int)
                  </label>
                  <input
                    type="number"
                    required
                    value={newBranch.step_order}
                    onChange={(e) => setNewBranch({ ...newBranch, step_order: e.target.value })}
                    placeholder="Timeline position (e.g. 6)"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    required
                    value={newBranch.address}
                    onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                    placeholder="Rua Bispo Dom José, 890"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Latitude (Float)
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      required
                      value={newBranch.latitude}
                      onChange={(e) => setNewBranch({ ...newBranch, latitude: e.target.value })}
                      placeholder="-25.4431"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Longitude (Float)
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      required
                      value={newBranch.longitude}
                      onChange={(e) => setNewBranch({ ...newBranch, longitude: e.target.value })}
                      placeholder="-49.2922"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Operating Hours Text
                  </label>
                  <input
                    type="text"
                    required
                    value={newBranch.hours}
                    onChange={(e) => setNewBranch({ ...newBranch, hours: e.target.value })}
                    placeholder="Mon-Sun: 5PM - 12AM"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={branchSubmitting}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold uppercase tracking-wider text-xs shadow-lg transition-transform duration-300 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer mt-6"
                >
                  {branchSubmitting ? 'Creating Node...' : 'Register Branch Node'}
                </button>
              </form>
            </div>
          </div>

          {/* Timeline Nodes Grid */}
          <div className="lg:col-span-2">
            <h3 className="font-display text-xl uppercase tracking-wider text-neutral-200 mb-4">Branch Nodes</h3>
            {loadingBranches ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="text-amber-500 animate-spin" size={32} />
              </div>
            ) : (
              <div className="space-y-3">
                {branches.map((branch) => (
                  <div
                    key={branch.id}
                    className="p-4 bg-neutral-900 border border-neutral-850 rounded-2xl flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {branch.step_order}
                        </span>
                        <h4 className="text-sm font-bold text-neutral-200">{branch.name}</h4>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-1 pl-8">
                        {branch.address}
                      </p>
                      <p className="text-[9px] text-neutral-550 pl-8 font-mono">
                        Coords: {branch.latitude}, {branch.longitude}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleBranchStatus(branch.id, branch.status)}
                      className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold text-neutral-400 hover:text-white cursor-pointer"
                    >
                      {branch.status === 'UNLOCKED' ? (
                        <><ToggleRight className="text-green-500" size={20} /> Active</>
                      ) : (
                        <><ToggleLeft className="text-neutral-600" size={20} /> Locked / Soon</>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
