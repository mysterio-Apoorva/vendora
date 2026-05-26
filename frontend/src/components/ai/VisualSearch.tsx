import React, { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Camera, Upload, Search, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import { aiService } from '@/services';
import { Product } from '@/types';
import { Link } from 'react-router-dom';

const VisualSearch: React.FC = () => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visualSearchMutation = useMutation({
    mutationFn: (image: File) => aiService.visualSearch(image),
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      visualSearchMutation.mutate(file);
    }
  };

  const clear = () => {
    setPreviewUrl(null);
    visualSearchMutation.reset();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
          <Camera className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" /> Visual Search
          </DialogTitle>
          <DialogDescription>
            Upload an image to find similar products in our store.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          {!previewUrl ? (
            <div 
              className="flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="p-4 bg-primary/5 rounded-full text-primary">
                <Upload className="h-8 w-8" />
              </div>
              <div className="text-center">
                <p className="font-bold">Drop your image here</p>
                <p className="text-sm text-muted-foreground">or click to browse files</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileSelect}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
              <div className="relative h-48 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                <img src={previewUrl} alt="Preview" className="h-full w-full object-contain" />
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={clear}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col gap-4">
                <h3 className="font-bold flex items-center gap-2">
                  {visualSearchMutation.isPending ? 'Analyzing Image...' : 'Search Results'}
                </h3>
                
                {visualSearchMutation.isPending ? (
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : visualSearchMutation.data?.products ? (
                  <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-2">
                    {visualSearchMutation.data.products.map((product: Product) => (
                      <Link key={product.id} to={`/product/${product.id}`} className="group space-y-2">
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                        </div>
                        <div>
                          <p className="font-bold text-sm truncate">{product.name}</p>
                          <p className="text-primary font-bold text-xs">${product.price.toFixed(2)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <ImageIcon className="h-8 w-8 opacity-20" />
                    <p>No results found yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VisualSearch;
