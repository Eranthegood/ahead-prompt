# Feedback Button System

A complete feedback collection system with a discreet side panel button, backend API, and MongoDB storage.

## ✨ Features

### Frontend Components
- **Discreet Feedback Button**: Fixed position button on the right side of the screen
- **Slide-out Form**: Clean, modern form with textarea for user input
- **Real-time Validation**: Client-side validation with user-friendly error messages
- **Loading States**: Visual feedback during submission
- **Toast Notifications**: Success/error notifications using the existing toast system

### Backend API
- **RESTful Endpoints**: Complete CRUD operations for feedback management
- **MongoDB Integration**: Persistent storage with Mongoose ODM
- **Data Enrichment**: Automatic capture of metadata (timestamp, user agent, URL, IP address)
- **Filtering & Pagination**: Query feedback by status, category, with pagination support
- **Admin Functions**: Update feedback status and categorization

### Admin Interface
- **Feedback Management**: View and manage all feedback submissions
- **Status Tracking**: Mark feedback as new, reviewed, or resolved
- **Categorization**: Organize feedback by type (bug, feature, improvement, other)
- **Priority Levels**: Set priority levels (low, medium, high)
- **Filtering**: Filter by status and category
- **Pagination**: Handle large volumes of feedback efficiently

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or remote instance)
- npm or yarn

### Installation

1. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd ..
   npm install
   ```

### Configuration

1. **Backend Environment** (optional)
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/feedback_db
   ```
   
   If no MongoDB URI is provided, the system will automatically use an in-memory MongoDB instance.

2. **Frontend Proxy** (already configured)
   The Vite config includes a proxy to route `/api` requests to `localhost:4000`.

### Running the System

1. **Start the Backend Server**
   ```bash
   cd backend
   npm start
   # or for development with auto-restart:
   npm run dev
   ```

2. **Start the Frontend Development Server**
   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:4000
   - Feedback Admin: http://localhost:8080/admin/feedback

## 📡 API Endpoints

### POST /api/feedback
Submit new feedback
```json
{
  "feedback": "User feedback text",
  "timestamp": "2025-09-17T19:42:00.000Z",
  "userAgent": "Mozilla/5.0...",
  "url": "http://localhost:8080/page"
}
```

### GET /api/feedback
Retrieve feedback with optional filtering
```
GET /api/feedback?status=new&category=bug&page=1&limit=10
```

### PATCH /api/feedback/:id
Update feedback status/category (admin)
```json
{
  "status": "reviewed",
  "category": "bug",
  "priority": "high"
}
```

### GET /api/health
Health check endpoint

## 🎨 UI/UX Design

### Feedback Button
- **Position**: Fixed on the right side, vertically centered
- **Style**: Subtle, blends with the existing design system
- **Interaction**: Smooth hover effects and transitions
- **Accessibility**: Proper focus states and keyboard navigation

### Feedback Form
- **Design**: Card-based layout with backdrop blur
- **Validation**: Real-time feedback validation
- **Responsive**: Works on all screen sizes
- **User Experience**: Clear call-to-actions and loading states

### Admin Interface
- **Layout**: Clean table/card-based design
- **Filtering**: Dropdown filters for status and category
- **Pagination**: Efficient navigation through large datasets
- **Actions**: Inline editing of status and priority

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Radix UI** components
- **Lucide React** icons
- **React Hook Form** for form handling
- **Sonner** for toast notifications

### Backend Stack
- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **CORS** enabled for cross-origin requests
- **Morgan** for request logging
- **In-memory MongoDB** fallback for development

### Database Schema
```javascript
{
  feedback: String (required),
  timestamp: Date,
  userAgent: String,
  url: String,
  ipAddress: String,
  userId: String (optional),
  status: ['new', 'reviewed', 'resolved'],
  category: ['bug', 'feature', 'improvement', 'other'],
  priority: ['low', 'medium', 'high']
}
```

## 📊 Success Metrics

The system tracks several metrics to measure success:

1. **Feedback Volume**: Number of feedback entries submitted
2. **User Engagement**: Click-through rate on the feedback button
3. **Response Time**: Time to mark feedback as reviewed/resolved
4. **Categorization**: Distribution of feedback types
5. **Resolution Rate**: Percentage of feedback marked as resolved

## 🔧 Customization

### Styling
The feedback button and form inherit the existing design system. To customize:

1. **Button Position**: Modify the `className` in `SimpleAppLayout.tsx`
2. **Colors**: Update Tailwind classes in `FeedbackButton.tsx`
3. **Form Size**: Adjust the `w-80` class in the form container

### Functionality
- **Add User Authentication**: Integrate with the existing auth system to associate feedback with users
- **Email Notifications**: Add email alerts for new feedback
- **Categories**: Extend the category enum in the Mongoose schema
- **File Attachments**: Add support for screenshot uploads

## 🚀 Deployment

### Production Setup
1. **Environment Variables**: Set production MongoDB URI
2. **Build Frontend**: `npm run build`
3. **Serve Static Files**: Configure Express to serve built files
4. **Process Management**: Use PM2 or similar for the backend
5. **Reverse Proxy**: Configure Nginx for production routing

### Docker Support (Optional)
The system can be containerized using the existing Docker setup in the project.

## 🐛 Troubleshooting

### Common Issues
1. **Backend not starting**: Ensure MongoDB is running or allow in-memory fallback
2. **CORS errors**: Check that the frontend proxy is configured correctly
3. **Form not submitting**: Verify the API endpoint is accessible
4. **Admin page not loading**: Ensure user authentication is working

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` in the backend.

## 📈 Future Enhancements

- **Real-time notifications** for admin users
- **Feedback analytics dashboard**
- **Integration with issue tracking systems**
- **Automated categorization using AI**
- **Multi-language support**
- **Feedback voting/rating system**
- **Export functionality for feedback data**

---

The feedback system is now fully integrated and ready for production use! 🎉