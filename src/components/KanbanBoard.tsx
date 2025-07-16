// src/components/KanbanBoard.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { PlusCircle, X } from "lucide-react";

// --- Task Detail Modal Component ---
const TaskDetailModal = ({ task, onClose, onUpdate, onDelete }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || "");
  }, [task]);

  const handleSave = () => {
    onUpdate(task.id, { title, description });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg border-2 border-black">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Edit Task</h2>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-red-500">
              <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="font-bold block mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-tst-purple"
            />
          </div>
          <div>
            <label className="font-bold block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              className="w-full p-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-tst-purple"
              placeholder="Add a more detailed description..."
            />
          </div>
        </div>
        <div className="flex justify-between items-center mt-6">
            <button
                onClick={() => onDelete(task.id)}
                className="px-4 py-2 bg-red-500 text-white font-bold rounded-md hover:bg-red-600"
            >
                Delete Task
            </button>
            <button
                onClick={handleSave}
                className="px-4 py-2 bg-tst-purple text-black font-bold rounded-md hover:opacity-90"
            >
                Save Changes
            </button>
        </div>
      </div>
    </div>
  );
};


// --- Add Task Form Component ---
const AddTaskForm = ({ columnId, onAddTask, onCancel }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (title.trim()) {
            onAddTask(columnId, title, description);
            setTitle('');
            setDescription('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-2 space-y-2 bg-white rounded-lg border-2 border-black shadow-md mt-2">
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title..."
                className="w-full p-2 border-none rounded focus:outline-none"
                autoFocus
            />
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description... (optional)"
                rows="2"
                className="w-full p-2 border-none rounded focus:outline-none text-sm"
            />
            <div className="flex items-center justify-end">
                <button type="button" onClick={onCancel} className="p-1 text-gray-500 hover:text-red-500">
                    <X size={20} />
                </button>
                <button type="submit" className="px-4 py-1 bg-tst-purple text-black font-bold rounded-md hover:opacity-90">
                    Add
                </button>
            </div>
        </form>
    );
};


// --- Main Kanban Board Component ---
const KanbanBoard = () => {
  const [columns, setColumns] = useState(null);
  const [addingToColumn, setAddingToColumn] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const supabase = createClientComponentClient();

  const processTasks = useCallback((tasks) => {
    const initialColumns = {
      "To-do": { name: "To-do", items: [] },
      "In Progress": { name: "In Progress", items: [] },
      "Complete": { name: "Complete", items: [] },
    };
    tasks.forEach((task) => {
      if (initialColumns[task.status]) {
        initialColumns[task.status].items.push(task);
      }
    });
    for (const columnId in initialColumns) {
        initialColumns[columnId].items.sort((a, b) => a.position - b.position);
    }
    setColumns(initialColumns);
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase.from("tasks").select("*");
      if (error) console.error("Error fetching tasks:", error);
      else processTasks(data);
    };
    fetchTasks();

    const channel = supabase
      .channel('realtime-tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
            fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, processTasks]);

  const handleAddTask = async (columnId, title, description) => {
    setAddingToColumn(null);
    const column = columns[columnId];
    const newPosition = column.items.length;

    // Optimistic UI Update
    const tempId = Date.now(); // Create a temporary ID
    const newTask = {
      id: tempId,
      title,
      description,
      status: columnId,
      position: newPosition,
      created_at: new Date().toISOString(),
    };

    const newItems = [...column.items, newTask];
    const newColumns = { ...columns, [columnId]: { ...column, items: newItems } };
    setColumns(newColumns);

    // Update database in the background
    await supabase
        .from('tasks')
        .insert({ title, description, status: columnId, position: newPosition });
  };

  const handleUpdateTask = async (taskId, updatedData) => {
    // Optimistic UI Update
    const newColumns = { ...columns };
    for (const columnId in newColumns) {
        const column = newColumns[columnId];
        const taskIndex = column.items.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
            column.items[taskIndex] = { ...column.items[taskIndex], ...updatedData };
            break;
        }
    }
    setColumns(newColumns);

    // Update database in the background
    await supabase.from('tasks').update(updatedData).eq('id', taskId);
  };

  const handleDeleteTask = async (taskId) => {
    if (confirm("Are you sure you want to delete this task?")) {
        // Optimistic UI Update
        const newColumns = { ...columns };
        for (const columnId in newColumns) {
            newColumns[columnId].items = newColumns[columnId].items.filter(t => t.id !== taskId);
        }
        setColumns(newColumns);
        setSelectedTask(null);

        // Update database in the background
        await supabase.from('tasks').delete().eq('id', taskId);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    const newColumns = { ...columns };
    const sourceColumn = newColumns[source.droppableId];
    const destColumn = newColumns[destination.droppableId];
    const [movedItem] = sourceColumn.items.splice(source.index, 1);
    destColumn.items.splice(destination.index, 0, movedItem);
    setColumns(newColumns);

    await supabase
        .from('tasks')
        .update({ status: destination.droppableId })
        .eq('id', draggableId);
  };

  if (!columns) return <p>Loading tasks...</p>;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Tasks</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {Object.entries(columns).map(([columnId, column]) => (
            <Droppable key={columnId} droppableId={columnId}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex flex-col p-4 rounded-lg bg-gray-100 transition-colors ${
                    snapshot.isDraggingOver ? "bg-tst-purple" : ""
                  }`}
                >
                  <h3 className="font-bold mb-4 flex justify-between">
                    {column.name}
                    <span className="bg-gray-200 text-sm font-bold px-2 py-1 rounded-full">
                      {column.items.length}
                    </span>
                  </h3>
                  <div className="space-y-4 flex-grow min-h-[100px]">
                    {column.items.map((item, index) => (
                      <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="relative cursor-pointer"
                            onClick={() => setSelectedTask(item)}
                          >
                            <div className="absolute top-0 left-0 w-full h-full bg-black rounded-lg transform translate-x-1 translate-y-1"></div>
                            <div className="relative bg-white p-4 rounded-lg border-2 border-black">
                              <h4 className="font-bold">{item.title}</h4>
                              {item.description && <p className="text-sm mt-1 text-gray-600">{item.description}</p>}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                  {addingToColumn === columnId ? (
                      <AddTaskForm
                          columnId={columnId}
                          onAddTask={handleAddTask}
                          onCancel={() => setAddingToColumn(null)}
                      />
                  ) : (
                      <button
                        onClick={() => setAddingToColumn(columnId)}
                        className="mt-4 flex items-center justify-center p-2 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors w-full"
                      >
                          <PlusCircle className="mr-2 h-4 w-4" /> Add task
                      </button>
                  )}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
      {selectedTask && (
        <TaskDetailModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
