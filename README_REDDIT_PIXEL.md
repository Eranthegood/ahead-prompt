# Reddit Pixel Setup for Ahead.love

## Overview
Reddit Pixel has been integrated to track conversions when users create their first prompt on the platform.

## Configuration Required

### 1. Set Your Reddit Pixel ID
Open `src/services/redditPixelService.ts` and replace the placeholder with your actual Reddit Pixel ID:

```typescript
// Replace this line:
const REDDIT_PIXEL_ID = 't2_XXXXXXXXX'; // Replace with your actual pixel ID

// With your actual pixel ID from Reddit Ads Manager:
const REDDIT_PIXEL_ID = 't2_YOUR_ACTUAL_PIXEL_ID';
```

### 2. Get Your Reddit Pixel ID
1. Go to [Reddit Ads Manager](https://ads.reddit.com/)
2. Navigate to "Pixels" in the left menu
3. Create a new pixel or use an existing one
4. Copy your Pixel ID (format: `t2_XXXXXXXXX`)

## Tracking Events

### Main Conversion Event
- **Event**: "Purchase" 
- **Trigger**: When a user creates their first prompt
- **Implementation**: Hooked into the gamification system achievement "first_prompt"

### Additional Tracking Events
- **Prompt Created**: Tracks every prompt creation (not just first)
- **Page Visit**: Tracks when users visit the site
- **Sign Up**: Can be implemented when user registration is added

## Testing

### Development Mode
- Debug logging is enabled in development
- Check browser console for Reddit Pixel events
- Look for logs starting with `[Reddit Pixel]`

### Verification
1. Open browser DevTools
2. Go to Network tab
3. Look for requests to `redditstatic.com/ads/pixel.js`
4. Create a test prompt to verify conversion tracking

## Implementation Details

### Files Modified
- `index.html`: Added Reddit Pixel base script
- `src/services/redditPixelService.ts`: Main tracking service
- `src/hooks/useGamification.tsx`: First prompt conversion tracking
- `src/components/QuickPromptDialog.tsx`: General prompt creation tracking
- `src/main.tsx`: Service initialization

### Conversion Flow
1. User creates their first prompt
2. Gamification system awards "first_prompt" achievement  
3. Achievement unlock triggers Reddit conversion tracking
4. Reddit receives "Purchase" event with conversion data

## Important Notes

- **Privacy**: Reddit Pixel respects user privacy settings
- **Performance**: Pixel loads asynchronously and won't block the app
- **Fallback**: If pixel fails to load, app continues normally
- **Testing**: Use development mode for testing before going live

## Analytics in Reddit Ads Manager

After setting up, you'll see:
- **Conversions**: Users who created their first prompt
- **Attribution**: Which ads drove conversions
- **Audience**: User behavior and demographics
- **ROI**: Return on ad spend metrics

## Troubleshooting

### Common Issues
1. **No conversions showing**: Check if Pixel ID is correct
2. **Console errors**: Verify all imports are working
3. **Multiple events**: Check if achievement is firing multiple times

### Debug Commands
```javascript
// Check if Reddit Pixel is loaded
console.log(window.rdt);

// Check pixel ID
console.log(window.REDDIT_PIXEL_ID);
```

## Next Steps

1. Set your actual Reddit Pixel ID
2. Test with a few prompt creations
3. Verify conversions in Reddit Ads Manager
4. Launch your ad campaigns
5. Monitor conversion rates and optimize

---

**Ready to launch your Reddit ads campaign!** 🚀