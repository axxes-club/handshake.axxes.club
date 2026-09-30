"use client";
import { useState } from "react";
import type { AppSummary } from "@/lib/account/types";
import type { Product } from "@/lib/products";
import { filterData } from "@/lib/account/view";
import { AppSummaryCard } from "./app-summary";
export function DataList({apps,products}:{apps:AppSummary[];products:Product[]}){
  const [query,setQuery]=useState("");const filtered=filterData(apps,query);
  return <><label htmlFor="data-search" className="sr-only">Search your data</label><input id="data-search" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search apps, records, or data types…" className="input mb-6 h-12"/>{filtered.length?<div className="grid items-stretch gap-4 xl:grid-cols-2">{filtered.map(a=><AppSummaryCard key={a.productKey} summary={a} product={products.find(p=>p.key===a.productKey)}/>)}</div>:<p role="status" className="card p-6 text-sm text-muted">No matching data in this view.</p>}</>;
}
