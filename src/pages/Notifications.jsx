import React, { useState } from 'react';
import { Clock, Package, AlertCircle } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      icon: 'clock',
      title: 'Le lait expire dans 2 jours',
      date: '26 juillet 2024',
      read: false,
      type: 'expiring'
    },
    {
      id: 2,
      icon: 'package',
      title: 'Le stock de fromage est faible',
      date: '25 juillet 2024',
      read: false,
      type: 'low-stock'
    },
    {
      id: 3,
      icon: 'alert',
      title: 'Les tomates expirent aujourd\'hui',
      date: '24 juillet 2024',
      read: false,
      type: 'expired'
    },
    {
      id: 4,
      icon: 'clock',
      title: 'Le poulet expire dans 3 jours',
      date: '23 juillet 2024',
      read: true,
      type: 'expiring'
    },
    {
      id: 5,
      icon: 'package',
      title: 'Le stock de carottes est faible',
      date: '22 juillet 2024',
      read: true,
      type: 'low-stock'
    }
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const getIcon = (type) => {
    switch(type) {
      case 'clock':
        return <Clock size={20} className="text-green-600" />;
      case 'package':
        return <Package size={20} className="text-green-600" />;
      case 'alert':
        return <AlertCircle size={20} className="text-green-600" />;
      default:
        return <Clock size={20} className="text-green-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-bold text-gray-900">Notifications</h2>
        <button 
          onClick={markAllAsRead}
          className="text-gray-600 hover:text-gray-900 font-medium"
        >
          Marquer tout comme lu
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div 
            key={notification.id}
            className={`flex items-start gap-4 p-6 rounded-2xl transition-all ${
              notification.read 
                ? 'bg-white border border-gray-200' 
                : 'bg-white border border-gray-200 shadow-sm'
            }`}
          >
            {/* Icon */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
              notification.read ? 'bg-gray-50' : 'bg-green-50'
            }`}>
              {getIcon(notification.icon)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold mb-1 ${
                notification.read ? 'text-gray-400' : 'text-gray-900'
              }`}>
                {notification.title}
              </h3>
              <p className={`text-sm ${
                notification.read ? 'text-gray-300' : 'text-gray-500'
              }`}>
                {notification.date}
              </p>
            </div>

            {/* Unread indicator */}
            {!notification.read && (
              <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}