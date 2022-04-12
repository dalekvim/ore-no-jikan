import { observable } from "mobx";
import { createContext } from "react";

type Routes = "Home" | "Login" | "Register";

class RouterStore {
  @observable screen: Routes = "Home";
}

export const RouterStoreContext = createContext(new RouterStore());
