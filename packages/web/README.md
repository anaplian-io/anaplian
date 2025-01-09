# **@anaplian/web**

This package provides actions for Anaplian agents for interacting with the web.

---

## **Installation**

```bash
npm install @anaplian/web
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
