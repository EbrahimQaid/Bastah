import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { 
  useListDashboardCategories, 
  useCreateDashboardCategory, 
  useDeleteDashboardCategory,
  getListDashboardCategoriesQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Categories() {
  const { data: categories, isLoading } = useListDashboardCategories();
  const createCategory = useCreateDashboardCategory();
  const deleteCategory = useDeleteDashboardCategory();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [newCatName, setNewCatName] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    
    createCategory.mutate({ data: { name: newCatName.trim() } }, {
      onSuccess: () => {
        setNewCatName("");
        toast({ title: "Category added" });
        queryClient.invalidateQueries({ queryKey: getListDashboardCategoriesQueryKey() });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this category?")) {
      deleteCategory.mutate({ categoryId: id }, {
        onSuccess: () => {
          toast({ title: "Category deleted" });
          queryClient.invalidateQueries({ queryKey: getListDashboardCategoriesQueryKey() });
        }
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        
        <form onSubmit={handleAdd} className="flex gap-4">
          <Input 
            placeholder="New category name..." 
            value={newCatName} 
            onChange={(e) => setNewCatName(e.target.value)} 
          />
          <Button type="submit" disabled={createCategory.isPending}>Add</Button>
        </form>

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="bg-card border rounded-lg divide-y">
            {categories?.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-4">
                <span className="font-medium">{cat.name}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive" 
                  onClick={() => handleDelete(cat.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {(!categories || categories.length === 0) && (
              <div className="p-8 text-center text-muted-foreground">No categories yet</div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}