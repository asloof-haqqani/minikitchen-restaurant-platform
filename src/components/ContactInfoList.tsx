import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { ContactInfoCard } from './ContactInfoCard';
import { RESTAURANT_INFO } from '../config/restaurantInfo';

export const ContactInfoList: React.FC = () => {
  return (
    <div className="space-y-3.5 max-w-md w-full">
      {/* 1. Call Us */}
      <ContactInfoCard
        icon={Phone}
        title="Call Us"
        details={RESTAURANT_INFO.phone}
        href={`tel:${RESTAURANT_INFO.phone.replace(/\s+/g, '')}`}
        delay={0.1}
      />

      {/* 2. Email Us */}
      <ContactInfoCard
        icon={Mail}
        title="Email Us"
        details={RESTAURANT_INFO.email}
        href={`mailto:${RESTAURANT_INFO.email}`}
        delay={0.2}
      />

      {/* 3. Visit Us */}
      <ContactInfoCard
        icon={MapPin}
        title="Visit Us"
        details={RESTAURANT_INFO.address}
        delay={0.3}
      />

      {/* 4. Opening Hours */}
      <ContactInfoCard
        icon={Clock}
        title="Opening Hours"
        details={RESTAURANT_INFO.openingHours}
        delay={0.4}
      />
    </div>
  );
};
