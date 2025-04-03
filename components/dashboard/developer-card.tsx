import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Globe, Linkedin, Twitter } from "lucide-react";

export function DeveloperCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Made by @jorgetoh</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid auto-fit minmax(120px, 1fr) gap-2">
          <Button variant="outline" size="sm" asChild className="w-full">
            <a
              href="https://github.com/jorgetoh"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild className="w-full">
            <a
              href="https://linkedin.com/in/jorgr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2"
            >
              <Linkedin className="h-4 w-4" />
              <span>LinkedIn</span>
            </a>
          </Button>

          <Button variant="outline" size="sm" asChild className="w-full">
            <a
              href="https://twitter.com/jorgtoh"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2"
            >
              <Twitter className="h-4 w-4" />
              <span>Twitter</span>
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild className="w-full">
            <a
              href="https://jorgetoh.me"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2"
            >
              <Globe className="h-4 w-4" />
              <span>Portfolio</span>
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
