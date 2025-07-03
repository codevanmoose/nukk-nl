# TODO List for nukk.nl

## ✅ Completed (Jan 2025)
- [x] Implement ScrapFly as additional fallback service
- [x] Remove custom Puppeteer scraper (unreliable, 403 errors)
- [x] Remove ScrapingBee and Browserless fallbacks
- [x] Simplify to ScrapFly-only architecture
- [x] Configure ScrapFly API key in production
- [x] Update documentation to reflect changes

## 🎯 Next Session Tasks

### High Priority
- [ ] Monitor ScrapFly usage (1,000 requests/month limit)
- [ ] Implement caching strategy to minimize API calls
- [ ] Add request counting/monitoring dashboard

### Medium Priority
- [ ] Optimize ScrapFly parameters for better extraction
- [ ] Add more robust error handling for edge cases
- [ ] Implement rate limiting to prevent abuse
- [ ] Add user feedback collection system

### Low Priority
- [ ] Consider adding a backup scraping service (if needed)
- [ ] Explore ScrapFly's advanced features (screenshots, etc.)
- [ ] Add analytics tracking for usage patterns
- [ ] Create admin dashboard for monitoring

## 💡 Future Enhancements
- [ ] Add support for other Dutch news sites
- [ ] Implement user accounts and saved analyses
- [ ] Add API for programmatic access
- [ ] Create browser extension
- [ ] Add real-time analysis notifications
- [ ] Implement fact-checking collaboration features

## 📝 Notes
- ScrapFly free tier: 1,000 requests/month
- Current API key: scp-live-b1ab2b60357145759b59cbdb9c63d578
- Average article analysis uses 1 ScrapFly request
- Multi-model analysis still uses 1 ScrapFly request (cached)