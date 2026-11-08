import { Route, Switch } from "wouter";
import { PublicLayout } from "@/components/layout/public-layout";
import Home from "@/pages/home";
import GhostRobotics from "@/pages/ghost-robotics";
import NotFound from "@/pages/not-found";

export default function App() {
  return (
    <PublicLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/ghost-robotics" component={GhostRobotics} />
        <Route component={NotFound} />
      </Switch>
    </PublicLayout>
  );
}
