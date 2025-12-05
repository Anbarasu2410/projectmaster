import Task from "../models/Task.js";
import { handleTransport, handleTransportUpdate } from "../handlers/transportHandler";


const taskHandlers = {
  TRANSPORT: handleTransport,
  // Other task types will be handled by the core Task model only
  WORK: null,
  MATERIAL: null,
  TOOL: null,
  INSPECTION: null,
  MAINTENANCE: null,
  ADMIN: null,
  TRAINING: null,
  OTHER: null,
};
const updateHandlers = {
  TRANSPORT: handleTransportUpdate, // You'll need to create this
  // Other task types will be handled by the core Task model only
  WORK: null,
  MATERIAL: null,
  TOOL: null,
  INSPECTION: null,
  MAINTENANCE: null,
  ADMIN: null,
  TRAINING: null,
  OTHER: null,
};

export async function createTask(taskData) {
  const session = await Task.startSession();
  session.startTransaction();

  try {
    const id = Math.floor(10000 + Math.random() * 90000);
    console.log(id); // e.g. 48293
    taskData.id = id;
    // Create core task
    const task = await Task.create([taskData], { session });
    console.log(`✅ Task created with ID: ${task[0].id}`);
    const taskId = task[0].id;

    // Delegate to specific handler based on task type
    if (taskHandlers[taskData.taskType]) {
      const result = await taskHandlers[taskData.taskType](taskId, taskData.additionalData, session);

      // For transport tasks, update the task with fleet task reference
      if (taskData.taskType === "TRANSPORT" && result) {
        await Task.updateOne(
          { id: taskId }, 
          { $set: { transportTaskId: result } }, 
          { session }
        );
      }
    }

    await session.commitTransaction();
    session.endSession();

    return task[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error in task service:', error);
    throw error;
  }
}
// 🔹 Update Task
export async function updateTask(taskId, updates) {
  const session = await Task.startSession();
  session.startTransaction();

  try {
    // Update core fields
    const updatedTask = await Task.findOneAndUpdate(
      { id: taskId }, 
      {
        $set: {
          taskName: updates.taskName,
          description: updates.description,
          startDate: updates.startDate,
          endDate: updates.endDate,
          status: updates.status,
          updatedAt: new Date(),
          additionalData: updates.additionalData,
        },
      }, 
      { new: true, session }
    );

    if (!updatedTask) throw new Error("Task not found");

    // Delegate to specific handler based on task type
    if (updateHandlers[updatedTask.taskType]) {
      const result = await updateHandlers[updatedTask.taskType](taskId, updates.additionalData, session);

      // For transport tasks, update the task with fleet task reference
      if (updatedTask.taskType === "TRANSPORT" && result) {
        await Task.updateOne(
          { id: taskId }, 
          { $set: { transportTaskId: result } }, 
          { session }
        );
      }
    }

    await session.commitTransaction();
    session.endSession();

    return updatedTask;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error in task service update:', error);
    throw error;
  }
}
