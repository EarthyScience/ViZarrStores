import { createContext } from "react";
import { ZarrDataset } from "../zarr/ZarrLoaderLRU";

export const zarrContext = createContext<ZarrDataset | undefined>(undefined)