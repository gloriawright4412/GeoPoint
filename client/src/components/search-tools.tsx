import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchToolsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
  onQuickSearch: (query: string) => void;
  isLoading: boolean;
}

export default function SearchTools({ 
  searchQuery, 
  setSearchQuery, 
  onSearch, 
  onQuickSearch, 
  isLoading 
}: SearchToolsProps) {
  const quickExamples = [
    "Times Square, NY",
    "40.7128, -74.0060",
    "Golden Gate Bridge"
  ];

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            type="text"
            placeholder="Enter address, city, or coordinates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button 
            onClick={onSearch}
            disabled={isLoading || !searchQuery.trim()}
            className="bg-primary hover:bg-blue-700 text-white whitespace-nowrap"
          >
            <Search className="mr-2 h-4 w-4" />
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Quick examples:</span>
          {quickExamples.map((example, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onQuickSearch(example)}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              {example}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
