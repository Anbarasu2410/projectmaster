// handlers/transportHandler.js
import FleetTask from "../models/FleetTask.js";
import FleetTaskPassenger from "../models/FleetTaskPassenger.js";
import FleetTaskMaterial from "../models/FleetTaskMaterial.js";
import FleetTaskTool from "../models/FleetTaskTool.js";

export async function handleTransport(taskId, data, session) {
  try {
    // Generate new ID for fleet task
    const lastFleetTask = await FleetTask.findOne().sort({ id: -1 });
    const newFleetTaskId = lastFleetTask ? lastFleetTask.id + 1 : 1;

    // Create main fleet task
    const fleetTask = await FleetTask.create([{
      id: newFleetTaskId,
      taskId: taskId,
      driverId: data.driverId,
      vehicleId: data.vehicleId,
      transportType: data.transportType,
      pickupLocation: data.pickupLocation,
      dropLocation: data.dropLocation,
      pickupTime: data.pickupTime,
      dropTime: data.dropTime,
      companyId: data.companyId,
      projectId: data.projectId,
      taskDate: new Date(),
      plannedPickupTime: data.pickupTime,
      plannedDropTime: data.dropTime,
      status: 'PLANNED',
      createdBy: data.createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    }], { session });

    const fleetTaskId = fleetTask[0].id;

    // Worker passengers
    if (data.transportType === "WORKER_TRANSPORT" && data.workers && data.workers.length) {
      const passengers = data.workers.map((empId) => ({ 
        fleetTaskId: fleetTaskId, 
        workerEmployeeId: empId 
      }));
      await FleetTaskPassenger.insertMany(passengers, { session });
    }

    // Materials
    if (data.transportType === "MATERIAL_TRANSPORT" && data.materialQuantities && data.materialQuantities.length) {
      const materials = data.materialQuantities.map((material) => ({ 
        fleetTaskId: fleetTaskId, 
        materialId: material.materialId, 
        quantity: material.quantity 
      }));
      await FleetTaskMaterial.insertMany(materials, { session });
    }

    // Tools
    if (data.transportType === "TOOL_TRANSPORT" && data.toolQuantities && data.toolQuantities.length) {
      const tools = data.toolQuantities.map((tool) => ({ 
        fleetTaskId: fleetTaskId, 
        toolId: tool.toolId, 
        quantity: tool.quantity 
      }));
      await FleetTaskTool.insertMany(tools, { session });
    }

    console.log(`✅ Fleet task created: ${newFleetTaskId} for transport task`);

    return fleetTask[0].id;
  } catch (error) {
    console.error('Error in transport handler:', error);
    throw error;
  }
}

export async function handleTransportUpdate(taskId, data, session) {
  try {
    // Find or create transport task
    let fleetTask = await FleetTask.findOne({ taskId: taskId }).session(session);

    if (!fleetTask) {
      // Generate new ID for fleet task
      const lastFleetTask = await FleetTask.findOne().sort({ id: -1 });
      const newFleetTaskId = lastFleetTask ? lastFleetTask.id + 1 : 1;

      fleetTask = await FleetTask.create([{
        id: newFleetTaskId,
        taskId: taskId,
        driverId: data.driverId,
        vehicleId: data.vehicleId,
        transportType: data.transportType,
        pickupLocation: data.pickupLocation,
        dropLocation: data.dropLocation,
        pickupTime: data.pickupTime,
        dropTime: data.dropTime,
        companyId: data.companyId,
        projectId: data.projectId,
        taskDate: new Date(),
        plannedPickupTime: data.pickupTime,
        plannedDropTime: data.dropTime,
        status: 'PLANNED',
        createdBy: data.createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      }], { session });
      
      console.log(`✅ New fleet task created: ${newFleetTaskId} for transport task update`);
      return fleetTask[0].id;
    }

    // Update main fleetTask
    await FleetTask.updateOne(
      { id: fleetTask.id },
      {
        $set: {
          driverId: data.driverId,
          vehicleId: data.vehicleId,
          transportType: data.transportType,
          pickupLocation: data.pickupLocation,
          dropLocation: data.dropLocation,
          pickupTime: data.pickupTime,
          dropTime: data.dropTime,
          companyId: data.companyId,
          projectId: data.projectId,
          plannedPickupTime: data.pickupTime,
          plannedDropTime: data.dropTime,
          updatedAt: new Date()
        }
      },
      { session }
    );

    // Cleanup old related entries
    await Promise.all([
      FleetTaskPassenger.deleteMany({ fleetTaskId: fleetTask.id }).session(session),
      FleetTaskMaterial.deleteMany({ fleetTaskId: fleetTask.id }).session(session),
      FleetTaskTool.deleteMany({ fleetTaskId: fleetTask.id }).session(session)
    ]);

    // Re-insert based on transport type
    if (data.transportType === "WORKER_TRANSPORT" && data.workers && data.workers.length) {
      const passengers = data.workers.map((empId) => ({ 
        fleetTaskId: fleetTask.id, 
        workerEmployeeId: empId 
      }));
      await FleetTaskPassenger.insertMany(passengers, { session });
    }

    if (data.transportType === "MATERIAL_TRANSPORT" && data.materialQuantities && data.materialQuantities.length) {
      const materials = data.materialQuantities.map((material) => ({ 
        fleetTaskId: fleetTask.id, 
        materialId: material.materialId, 
        quantity: material.quantity 
      }));
      await FleetTaskMaterial.insertMany(materials, { session });
    }

    if (data.transportType === "TOOL_TRANSPORT" && data.toolQuantities && data.toolQuantities.length) {
      const tools = data.toolQuantities.map((tool) => ({ 
        fleetTaskId: fleetTask.id, 
        toolId: tool.toolId, 
        quantity: tool.quantity 
      }));
      await FleetTaskTool.insertMany(tools, { session });
    }

    console.log(`✅ Fleet task updated: ${fleetTask.id} for transport task`);

    return fleetTask.id;
  } catch (error) {
    console.error('Error in transport update handler:', error);
    throw error;
  }
}