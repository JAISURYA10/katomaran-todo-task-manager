"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, CheckCircle2, Circle, Edit, LogOut, Plus, Trash2, User, Filter } from "lucide-react"
import { format } from "date-fns"

interface Task {
  id: string
  title: string
  description: string
  dueDate: string
  status: "Open" | "Complete"
  createdAt: string
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filter, setFilter] = useState<"all" | "open" | "complete">("all")
  const router = useRouter()

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated")
    const user = localStorage.getItem("username")

    if (!auth || auth !== "true") {
      router.push("/")
      return
    }

    setIsAuthenticated(true)
    setUsername(user || "")
    loadTasks()
  }, [router])

  const loadTasks = () => {
    const savedTasks = localStorage.getItem("tasks")
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }

  const saveTasks = (newTasks: Task[]) => {
    localStorage.setItem("tasks", JSON.stringify(newTasks))
    setTasks(newTasks)
  }

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("username")
    router.push("/")
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setDueDate("")
    setEditingTask(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingTask) {
      // Update existing task
      const updatedTasks = tasks.map((task) =>
        task.id === editingTask.id ? { ...task, title, description, dueDate } : task,
      )
      saveTasks(updatedTasks)
    } else {
      // Create new task
      const newTask: Task = {
        id: Date.now().toString(),
        title,
        description,
        dueDate,
        status: "Open",
        createdAt: new Date().toISOString(),
      }
      saveTasks([...tasks, newTask])
    }

    resetForm()
    setIsDialogOpen(false)
  }

  const toggleTaskStatus = (taskId: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, status: task.status === "Open" ? "Complete" : ("Open" as const) } : task,
    )
    saveTasks(updatedTasks)
  }

  const deleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId)
    saveTasks(updatedTasks)
  }

  const editTask = (task: Task) => {
    setEditingTask(task)
    setTitle(task.title)
    setDescription(task.description)
    setDueDate(task.dueDate)
    setIsDialogOpen(true)
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true
    if (filter === "open") return task.status === "Open"
    if (filter === "complete") return task.status === "Complete"
    return true
  })

  const openTasks = tasks.filter((task) => task.status === "Open").length
  const completeTasks = tasks.filter((task) => task.status === "Complete").length

  if (!isAuthenticated) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-blue-600 p-2 rounded-lg mr-3">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Todo Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-1" />
                {username}
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Circle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Open Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{openTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completeTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingTask ? "Edit Task" : "Create New Task"}</DialogTitle>
                  <DialogDescription>
                    {editingTask ? "Update your task details below." : "Add a new task to your list."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter task title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter task description"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingTask ? "Update Task" : "Create Task"}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={filter} onValueChange={(value: "all" | "open" | "complete") => setFilter(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                <p className="text-gray-500 mb-4">
                  {filter === "all" ? "Get started by creating your first task." : `No ${filter} tasks found.`}
                </p>
                {filter === "all" && (
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Task
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <Card
                key={task.id}
                className={`transition-all hover:shadow-md ${task.status === "Complete" ? "opacity-75" : ""}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className="mt-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        {task.status === "Complete" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>
                      <div className="flex-1">
                        <h3 className={`font-medium text-gray-900 ${task.status === "Complete" ? "line-through" : ""}`}>
                          {task.title}
                        </h3>
                        {task.description && <p className="text-gray-600 mt-1 text-sm">{task.description}</p>}
                        <div className="flex items-center space-x-4 mt-3">
                          <Badge variant={task.status === "Complete" ? "secondary" : "default"}>{task.status}</Badge>
                          <span className="text-sm text-gray-500">
                            Due: {format(new Date(task.dueDate), "MMM dd, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="ghost" size="sm" onClick={() => editTask(task)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTask(task.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
