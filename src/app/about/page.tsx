"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { FluidContainer } from "../components/FluidContainer";
import { Typography } from "@/components/ui/typography";

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <FluidContainer>
        <div className="py-16">
          {/* Page Header */}
          <motion.div
            className="text-center min-h-[60vh] flex flex-col justify-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <PageHeader
              icon={<Shield className="w-12 h-12 text-orange-500" />}
              title="Doctrinal Statement"
              subtitle="Establishing a concise summary of what we believe, as guided by Scripture, is necessary because it guards us from error and unites us in the essentials of Christian faith."
            />
          </motion.div>

          {/* Content will go here */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Typography variant="muted">
              Content coming soon...
            </Typography>
          </motion.div>
        </div>
      </FluidContainer>
    </div>
  );
}
