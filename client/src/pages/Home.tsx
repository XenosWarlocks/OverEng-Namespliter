import { useState } from "react";
import { useSplitNames } from "@/hooks/use-split";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Copy, FileSpreadsheet, Wand2, RefreshCw, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [inputNames, setInputNames] = useState("");
  const [results, setResults] = useState<Array<{ original: string; firstName: string; lastName: string }> | null>(null);
  const { mutate: splitNames, isPending } = useSplitNames();
  const { toast } = useToast();

  const handleSplit = () => {
    if (!inputNames.trim()) {
      toast({
        title: "Input required",
        description: "Please enter at least one name to split.",
        variant: "destructive",
      });
      return;
    }

    splitNames(
      { names: inputNames },
      {
        onSuccess: (data) => {
          setResults(data.results);
          toast({
            title: "Success!",
            description: `Successfully split ${data.results.length} names.`,
          });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const copyToClipboard = () => {
    if (!results) return;

    // Create TSV format for Excel (Tab Separated Values)
    const header = "Original Name\tFirst Name\tLast Name\n";
    const rows = results.map(r => `${r.original}\t${r.firstName}\t${r.lastName}`).join("\n");
    const tsvContent = header + rows;

    navigator.clipboard.writeText(tsvContent);
    toast({
      title: "Copied to clipboard",
      description: "Paste directly into Excel or Google Sheets.",
    });
  };

  const downloadCSV = () => {
    if (!results) return;
    
    const header = "Original Name,First Name,Last Name\n";
    const rows = results.map(r => `"${r.original}","${r.firstName}","${r.lastName}"`).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + encodeURI(header + rows);
    
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "split_names.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleHistorySelect = (text: string) => {
    setInputNames(text);
    // Automatically process when loading from history for better UX
    splitNames(
      { names: text },
      {
        onSuccess: (data) => setResults(data.results)
      }
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Hidden on mobile, typically controlled by a drawer but simplified here for desktop-first layout */}
      <div className="hidden md:block w-80 h-full shrink-0">
        <Sidebar onSelectHistory={handleHistorySelect} />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="px-8 py-6 border-b border-border/40 bg-background/80 backdrop-blur-sm z-10">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600">
                NameSplitter Pro
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Batch process names into structured first and last name columns
              </p>
            </div>
            <div className="hidden sm:flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setInputNames(""); setResults(null); }}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            
            {/* Input Section */}
            <div className="flex flex-col gap-4 h-full min-h-[400px]">
              <Card className="flex-1 p-1 flex flex-col shadow-lg border-border/60 hover:border-primary/20 transition-colors">
                <div className="px-4 py-3 bg-muted/30 border-b border-border/50 flex justify-between items-center rounded-t-lg">
                  <span className="text-sm font-medium text-foreground">Input Names</span>
                  <span className="text-xs text-muted-foreground font-mono">One per line</span>
                </div>
                <Textarea 
                  value={inputNames}
                  onChange={(e) => setInputNames(e.target.value)}
                  placeholder="John Doe&#10;Jane Smith&#10;Dr. Martin Luther King Jr."
                  className="flex-1 min-h-[300px] border-0 focus-visible:ring-0 resize-none font-mono text-sm leading-relaxed p-4 bg-transparent"
                  spellCheck={false}
                />
              </Card>
              
              <Button 
                onClick={handleSplit} 
                disabled={isPending || !inputNames.trim()}
                size="lg"
                className="w-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98] font-semibold text-lg h-14"
              >
                {isPending ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Split Names
                  </>
                )}
              </Button>
            </div>

            {/* Output Section */}
            <div className="flex flex-col gap-4 h-full min-h-[400px]">
              <Card className="flex-1 flex flex-col shadow-lg overflow-hidden border-border/60 bg-card/50 backdrop-blur-sm">
                <div className="px-4 py-3 bg-muted/30 border-b border-border/50 flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">Results</span>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-xs"
                      onClick={downloadCSV}
                      disabled={!results}
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      CSV
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="h-8 text-xs bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                      onClick={copyToClipboard}
                      disabled={!results}
                    >
                      <Copy className="w-3.5 h-3.5 mr-1.5" />
                      Copy for Excel
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-auto bg-card relative">
                  {!results ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <FileSpreadsheet className="w-8 h-8 opacity-50" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground">Ready to process</h3>
                      <p className="text-sm mt-1 max-w-xs">
                        Enter names on the left and click "Split Names" to generate your structured data.
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10 shadow-sm">
                        <TableRow className="border-border/50 hover:bg-transparent">
                          <TableHead className="w-[40%] font-semibold">Original</TableHead>
                          <TableHead className="w-[30%] font-semibold text-primary">First Name</TableHead>
                          <TableHead className="w-[30%] font-semibold text-primary">Last Name</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {results.map((row, i) => (
                            <motion.tr
                              key={i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.03, duration: 0.2 }}
                              className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                            >
                              <TableCell className="font-mono text-xs text-muted-foreground">{row.original}</TableCell>
                              <TableCell className="font-medium text-foreground bg-primary/5">{row.firstName}</TableCell>
                              <TableCell className="font-medium text-foreground">{row.lastName}</TableCell>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  )}
                </div>
              </Card>
              
              <div className="h-14 flex items-center justify-center text-sm text-muted-foreground">
                {results ? (
                  <span>Processed {results.length} names successfully</span>
                ) : (
                  <span>&nbsp;</span>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
