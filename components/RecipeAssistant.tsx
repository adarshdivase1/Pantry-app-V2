import React, { useState } from 'react';
import { PantryItem, Recipe } from '../types';
import { generateRecipes } from '../services/geminiService';
import { Loader2, ChefHat, Clock, Signal, Flame, ChevronRight } from 'lucide-react';

interface RecipeAssistantProps {
  items: PantryItem[];
}

const RecipeAssistant: React.FC<RecipeAssistantProps> = ({ items }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateRecipes(items);
      setRecipes(result);
      setSelectedRecipe(null); // Reset selection
    } catch (e) {
      alert("Failed to generate recipes. Check your API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Chef Assistant</h1>
            <p className="text-slate-500">Get AI recipes based on your pantry.</p>
        </div>
        <button
            onClick={handleGenerate}
            disabled={loading || items.length === 0}
            className="flex items-center px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 transition-all shadow-lg shadow-primary-500/20"
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ChefHat className="w-5 h-5 mr-2" />}
            {loading ? 'Thinking...' : 'Generate Ideas'}
        </button>
      </header>

      {items.length === 0 && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-white rounded-2xl border border-slate-100 border-dashed">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <ChefHat className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Your pantry is empty</h3>
            <p className="text-slate-500 max-w-sm mt-2">Add items to your inventory so I can suggest what to cook!</p>
          </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden min-h-0">
        {/* Recipe List */}
        <div className={`space-y-4 overflow-y-auto pr-2 ${selectedRecipe ? 'hidden lg:block' : 'block'}`}>
            {recipes.map((recipe, idx) => (
                <div 
                    key={idx}
                    onClick={() => setSelectedRecipe(recipe)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all hover:shadow-md ${selectedRecipe === recipe ? 'bg-primary-50 border-primary-200 ring-1 ring-primary-500' : 'bg-white border-slate-200 hover:border-primary-200'}`}
                >
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-800 text-lg">{recipe.title}</h3>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                            recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                            {recipe.difficulty}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                        <div className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {recipe.prepTime}</div>
                        {recipe.calories && <div className="flex items-center"><Flame className="w-4 h-4 mr-1" /> ~{recipe.calories} kcal</div>}
                    </div>
                </div>
            ))}
            {recipes.length === 0 && !loading && items.length > 0 && (
                 <div className="flex-1 flex flex-col items-center justify-center text-center p-10 mt-10">
                    <p className="text-slate-400">Ready to cook? Click "Generate Ideas".</p>
                 </div>
            )}
        </div>

        {/* Recipe Details */}
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col ${selectedRecipe ? 'block fixed inset-0 z-50 lg:static lg:z-auto m-4 lg:m-0' : 'hidden lg:flex items-center justify-center bg-slate-50 border-dashed'}`}>
            {selectedRecipe ? (
                <div className="h-full flex flex-col">
                     <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <div>
                             <h2 className="text-xl font-bold text-slate-800">{selectedRecipe.title}</h2>
                             <p className="text-sm text-slate-500 mt-1">Ready in {selectedRecipe.prepTime}</p>
                        </div>
                        <button onClick={() => setSelectedRecipe(null)} className="lg:hidden p-2 bg-white rounded-full shadow-sm">
                            <ChevronRight className="w-5 h-5 rotate-180" />
                        </button>
                     </div>
                     <div className="p-6 overflow-y-auto flex-1 space-y-6">
                        <div>
                            <h3 className="font-semibold text-slate-800 mb-3 flex items-center">
                                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs mr-2">1</div>
                                Ingredients
                            </h3>
                            <ul className="space-y-2">
                                {selectedRecipe.ingredients.map((ing, i) => (
                                    <li key={i} className="flex items-start text-slate-600 text-sm">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 mr-2 shrink-0"></span>
                                        {ing}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800 mb-3 flex items-center">
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs mr-2">2</div>
                                Instructions
                            </h3>
                            <div className="space-y-4">
                                {selectedRecipe.instructions.map((step, i) => (
                                    <div key={i} className="text-slate-600 text-sm leading-relaxed">
                                        <span className="font-bold text-slate-800 mr-2">Step {i+1}:</span>
                                        {step}
                                    </div>
                                ))}
                            </div>
                        </div>
                     </div>
                </div>
            ) : (
                <div className="text-center p-6">
                    <div className="w-12 h-12 bg-slate-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <ChevronRight className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">Select a recipe to view details</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default RecipeAssistant;