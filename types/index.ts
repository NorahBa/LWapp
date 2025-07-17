import { subscribe } from "firebase/data-connect";
import { Timestamp } from "firebase/firestore";
import { Reference} from "firebase/firestore";

export type Products = {
  id: string;
  name: string;
  type: "device";
  price: number;
  image_url: string;
};
export type Subscription_plans = {
  Description: string;
  name: string;
  type: "license";
  price: number;
  image_url: string; 
};
export type shopping_carts = {
  address: string;
  email: string;
  createdAt: Timestamp;
  items: Products[] | Subscription_plans[];
  name: string;
  phone: string;
  total: number;
  userId: Reference;
};
 