import { Router } from "express"
import { auth } from "../auth"

export const authRouter = Router()

// Better-auth handles all auth routes automatically
authRouter.all("*", async (req, res) => {
  try {
    // Convert Express request to Web API Request format
    const port = process.env.PORT || 3000
    const webUrl = process.env.WEB_URL || "http://localhost:4200"
    const url = new URL(req.originalUrl || req.url, `http://localhost:${port}`)
    
    const webRequest = new Request(url, {
      method: req.method,
      headers: req.headers as HeadersInit,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    })

    const response = await auth.handler(webRequest)
    
    // Copy all headers from the response
    response.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })
    
    // Handle redirects - redirect to frontend after OAuth success
    if ((response.status === 302 || response.status === 301) && response.headers.get('location')) {
      const location = response.headers.get('location') || ''
      
      // For callback routes or root redirects, redirect to frontend
      if (location.includes('/callback/') || location === '/' || location === '') {
        return res.redirect(302, webUrl)
      }
      
      return res.redirect(response.status, location)
    }
    
    // For normal responses, set status and send body
    res.status(response.status)
    const body = await response.text()
    res.send(body)
  } catch (error) {
    console.error('Auth handler error:', error)
    res.status(500).json({ error: 'Authentication error' })
  }
})
