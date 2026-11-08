import beefShawarmaWrap from '../assets/images/beef_shawarma_wrap_1794144201442.jpg';
import berryBlissMojito from '../assets/images/berry_bliss_mojito_1794144215709.jpg';
import chocolateLavaCake from '../assets/images/chocolate_lava_cake_1794144216052.jpg';
import foodBarbecueWings from '../assets/images/food_bbq_wings_1793943079103.jpg';
import foodCheeseBurger from '../assets/images/food_cheese_burger_1793979902653.jpg';
import foodChickenAlfredo from '../assets/images/food_chicken_alfredo_1793979932174.jpg';
import foodChickenWrap from '../assets/images/food_chicken_wrap_1793943077739.jpg';
import foodCitrusBurrata from '../assets/images/food_citrus_burrata_1793941745148.jpg';
import foodClassicBurger from '../assets/images/food_classic_burger_1793943077745.jpg';
import foodGrilledChicken from '../assets/images/food_grilled_chicken_1793943077429.jpg';
import foodIcedLatte from '../assets/images/food_iced_latte_1793943078034.jpg';
import foodSignatureTrufflePasta from '../assets/images/food_signature_truffle_pasta_1793941744497.jpg';
import foodSpicyArrabiata from '../assets/images/food_spicy_arrabiata_1793979947855.jpg';
import foodSpicyChickenBurger from '../assets/images/food_spicy_chicken_burger_1793979918005.jpg';
import foodWagyuStriploin from '../assets/images/food_wagyu_striploin_1793941744885.jpg';
import heroRestaurantAmbiance from '../assets/images/hero_restaurant_ambiance_1793941743774.jpg';
import heroSteakBackground from '../assets/images/hero_steak_bg_1793946373904.jpg';
import periPeriChicken from '../assets/images/peri_peri_chicken_1794144200612.jpg';
import restaurantEntrance from '../assets/images/restaurant_entrance_1793980636853.jpg';
import reserveTableAmbiance from '../assets/images/reserve_table_ambiance_1793980663419.jpg';
import smashBeefBurger from '../assets/images/smash_beef_burger_1794144185428.jpg';
import truffleFries from '../assets/images/truffle_fries_1794144234391.jpg';

const imageUrlsByName = new Map([
  ['beef_shawarma_wrap_1794144201442.jpg', beefShawarmaWrap],
  ['berry_bliss_mojito_1794144215709.jpg', berryBlissMojito],
  ['chocolate_lava_cake_1794144216052.jpg', chocolateLavaCake],
  ['food_bbq_wings_1793943079103.jpg', foodBarbecueWings],
  ['food_cheese_burger_1793979902653.jpg', foodCheeseBurger],
  ['food_chicken_alfredo_1793979932174.jpg', foodChickenAlfredo],
  ['food_chicken_wrap_1793943077739.jpg', foodChickenWrap],
  ['food_citrus_burrata_1793941745148.jpg', foodCitrusBurrata],
  ['food_classic_burger_1793943077745.jpg', foodClassicBurger],
  ['food_grilled_chicken_1793943077429.jpg', foodGrilledChicken],
  ['food_iced_latte_1793943078034.jpg', foodIcedLatte],
  ['food_signature_truffle_pasta_1793941744497.jpg', foodSignatureTrufflePasta],
  ['food_spicy_arrabiata_1793979947855.jpg', foodSpicyArrabiata],
  ['food_spicy_chicken_burger_1793979918005.jpg', foodSpicyChickenBurger],
  ['food_wagyu_striploin_1793941744885.jpg', foodWagyuStriploin],
  ['hero_restaurant_ambiance_1793941743774.jpg', heroRestaurantAmbiance],
  ['hero_steak_bg_1793946373904.jpg', heroSteakBackground],
  ['peri_peri_chicken_1794144200612.jpg', periPeriChicken],
  ['restaurant_entrance_1793980636853.jpg', restaurantEntrance],
  ['reserve_table_ambiance_1793980663419.jpg', reserveTableAmbiance],
  ['smash_beef_burger_1794144185428.jpg', smashBeefBurger],
  ['truffle_fries_1794144234391.jpg', truffleFries],
]);

export function restaurantImageUrl(imagePath: string): string {
  if (/^(https?:|data:|blob:)/i.test(imagePath)) return imagePath;

  if (imagePath.startsWith('/src/assets/images/')) {
    const fileName = imagePath.split('/').pop()!;
    return imageUrlsByName.get(fileName) ?? imagePath;
  }

  if (imagePath.startsWith('/public/')) {
    return imagePath.replace(/^\/public\//, '/');
  }

  return imagePath;
}
