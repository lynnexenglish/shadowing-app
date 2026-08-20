"use client";
import { DashboardLayout } from "../../components/layout/dashboard";
import TeacherOneSignalInit from "../../components/teacher/TeacherOneSignalInit";

export default function TeacherLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardLayout userType="teacher">
      <TeacherOneSignalInit />
      {children}
    </DashboardLayout>
  );
}
