import express from "express";
import { DeviceIdentityService } from "./services/device-identity.service";
import { TriangulationService } from "./services/triangulation.service";
import { ForensicsService } from "./services/forensics.service";
import { DashboardService } from "./services/dashboard.service";

const app = express();
app.use(express.json());

const deviceIdentityService = new DeviceIdentityService();
const triangulationService = new TriangulationService();
const forensicsService = new ForensicsService();
const dashboardService = new DashboardService();

// Device identity endpoint
app.post("/api/identity/resolve", async (req, res) => {
  const result = await deviceIdentityService.resolveDevice(req.body);
  res.json(result);
});

// Triangulation endpoint
app.post("/api/triangulate", async (req, res) => {
  const result = await triangulationService.triangulate(req.body);
  res.json(result);
});

// Forensics endpoint
app.post("/api/forensics/extract", async (req, res) => {
  const result = await forensicsService.extractLocationLogs(req.body.rawData);
  res.json(result);
});

// Dashboard endpoint
app.get("/api/dashboard/:deviceId", async (req, res) => {
  const result = await dashboardService.getTrackingData(req.params.deviceId);
  res.json(result);
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Intelligent Tracking API running on port ${PORT}`);
});
