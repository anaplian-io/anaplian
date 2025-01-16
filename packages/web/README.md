# **@anaplian/web**

This package provides actions for Anaplian agents for interacting with the web.

---

## **Installation**

```bash
npm install --save @anaplian/web
```

## **API Reference**

### **Actions**

#### `HttpGetAction`

**Description**

Allows an Anaplian agent to perform a GET request on a web page.

**Parameters**
None.

#### `TavilySearchAction`

**Description**

Performs a web search using [Tavily](https://tavily.com).

**Parameters**

- `tavilyClient` - An official Tavily JavaScript client (see `@tavily/core`).
- `maxResults` - The maximum number of results to include in search responses.

#### `MarketQuoteAction`

**Description**

Fetches a quote for a symbol using Yahoo Finance.

**Parameters**
None.

### **Context Providers**

#### `MarketQuoteContextProvider`

**Description**
Keeps a defined set of realtime market quotes in the context so that the agent does not have to explicitly request them.

**Parameters**

- `symbols` - An array of market symbols (e.g. ["AAPL", "NVDA", "SPY"])
