export interface RestaurantConfig {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  openingHours: string;
  logoUrl: string;
  mapEmbedUrl: string;
}

export const RESTAURANT_INFO: RestaurantConfig = {
  name: 'MiniKitchen',
  tagline: 'Good Food, Great Moments.',
  phone: '+94 76 673 7844',
  email: 'info@minikitchen.lk',
  address: 'Colombo, Sri Lanka',
  openingHours: 'Mon – Sun | 11:00 AM – 10:00 PM',
  logoUrl: 'https://i.postimg.cc/564H5nPc/b64a9666-75f4-4947-85c6-0591435cd1c6.png',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126743.58586013346!2d79.78616429999999!3d6.9218335!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae253d10f7a7003%3A0x320b2e4d32d3838d!2sColombo%2C%20Sri%20Lanka!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk',
};
