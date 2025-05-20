import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNavbar } from "@/components/MobileNavbar";
import { ProgressOverview } from "@/components/ProgressOverview";
import { RoutineGroup } from "@/components/RoutineGroup";
import { AddRoutineModal } from "@/components/AddRoutineModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import type { Group } from "@shared/schema";

export default function Dashboard() {
  const [isAddRoutineModalOpen, setIsAddRoutineModalOpen] = useState(false);
  const today = new Date();
  
  // Fetch today's routines grouped by their groups
  const { data: groups = [], isLoading } = useQuery<Group[]>({
    queryKey: ['/api/routines/daily', today.toISOString().split('T')[0]],
  });

  // Fetch all routines for today to calculate progress
  const { data: allRoutines = [] } = useQuery({
    queryKey: ['/api/routines/daily/flat', today.toISOString().split('T')[0]],
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <MobileNavbar />
      
      <main className="flex-1 overflow-y-auto pb-mobile-nav md:pb-0">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Today's Routines</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {format(today, "EEEE, MMMM d, yyyy")}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <Button 
                onClick={() => setIsAddRoutineModalOpen(true)}
                className="flex items-center"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Routine
              </Button>
            </div>
          </div>
          
          <ProgressOverview routines={allRoutines} />
          
          {isLoading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 flex justify-center">
              <p className="text-gray-500 dark:text-gray-400">Loading routines...</p>
            </div>
          ) : groups.length > 0 ? (
            groups.map((group) => (
              <RoutineGroup key={group.id} group={group} date={today} />
            ))
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No routines for today</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                You haven't set up any routines for today. Get started by adding your first routine.
              </p>
              <Button 
                onClick={() => setIsAddRoutineModalOpen(true)}
              >
                Add Your First Routine
              </Button>
            </div>
          )}
          
          {/* Add new routine button (mobile only) */}
          <div className="fixed bottom-20 right-4 md:hidden">
            <Button 
              onClick={() => setIsAddRoutineModalOpen(true)}
              className="rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
              size="icon"
            >
              <Plus size={24} />
            </Button>
          </div>
        </div>
      </main>
      
      <AddRoutineModal 
        isOpen={isAddRoutineModalOpen}
        onClose={() => setIsAddRoutineModalOpen(false)}
      />
    </div>
  );
}
