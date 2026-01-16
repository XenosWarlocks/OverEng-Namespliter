import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post(api.split.process.path, async (req, res) => {
    try {
      const { names } = api.split.process.input.parse(req.body);
      
      const lines = names.split('\n').filter(line => line.trim() !== '');
      const results = lines.map(line => {
        const parts = line.trim().split(/\s+/);
        let firstName = "";
        let lastName = "";
        
        if (parts.length > 0) {
          firstName = parts[0];
          if (parts.length > 1) {
            lastName = parts.slice(1).join(" ");
          }
        }
        
        return {
          original: line.trim(),
          firstName,
          lastName
        };
      });

      // Save to history
      await storage.createSplitHistory({
        originalText: names,
        processedData: results
      });

      res.json({
        original: names,
        results
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.split.history.path, async (req, res) => {
    const history = await storage.getSplitHistory();
    res.json(history);
  });

  // Seed data
  const history = await storage.getSplitHistory();
  if (history.length === 0) {
    await storage.createSplitHistory({
      originalText: "John Doe\nJane Smith\nBob Johnson",
      processedData: [
        { original: "John Doe", firstName: "John", lastName: "Doe" },
        { original: "Jane Smith", firstName: "Jane", lastName: "Smith" },
        { original: "Bob Johnson", firstName: "Bob", lastName: "Johnson" }
      ]
    });
  }

  return httpServer;
}
