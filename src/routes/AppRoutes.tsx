import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../components/auth/LoginPage';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { Layout } from '../components/layout/Layout';
import { HomeDashboard } from '../components/home/HomeDashboard';
import { DiaryList } from '../components/diary/DiaryList';
import { MilestoneList } from '../components/milestones/MilestoneList';
import { MeetingList } from '../components/meetings/MeetingList';
import { PlanList } from '../components/plans/PlanList';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomeDashboard />} />
        <Route path="home" element={<HomeDashboard />} />
        <Route path="diary" element={<DiaryList />} />
        <Route path="milestones" element={<MilestoneList />} />
        <Route path="meetings" element={<MeetingList />} />
        <Route path="plans" element={<PlanList />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
