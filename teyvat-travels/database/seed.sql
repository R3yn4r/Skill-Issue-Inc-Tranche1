-- =====================================================================
-- Teyvat Travels - seed data (taken from the existing static pages)
-- Run AFTER schema.sql. Re-running RESETS the content tables below to
-- this original data (nations, facts, packages, stops, locations, tips,
-- faqs, director). It never touches inquiries or users.
-- =====================================================================

SET NAMES utf8mb4;
USE teyvat_travels;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE package_stops;
TRUNCATE TABLE packages;
TRUNCATE TABLE nation_facts;
TRUNCATE TABLE locations;
TRUNCATE TABLE tips;
TRUNCATE TABLE nations;
TRUNCATE TABLE faqs;
TRUNCATE TABLE director_profile;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------- nations ----------------
INSERT INTO nations (id, slug, name, element, kicker, tagline, accent_color, sort_order, image_path, hero_alt, card_alt, meta_description, about_kicker, about_heading, about_body) VALUES (1, 'mondstadt', 'Mondstadt', 'Anemo', 'The city of freedom', 'A city of freedom in the northeast of Teyvat.', '#82d7bd', 1, 'assets/img/mondstadt.webp', 'Mondstadt''s island city surrounded by Cider Lake and mountain plains under a bright sky', 'The green highlands and clear blue skies of Mondstadt', 'Explore Mondstadt, the city of freedom in northeast Teyvat — Cider Lake, Windrise, the Grand Cathedral of Mondstadt, and more must-see destinations.', 'The city of freedom', 'An island city on Cider Lake', 'Mondstadt sits on an island in the middle of Cider Lake, surrounded by mountains and wide open plains. The city is known across Teyvat for its wines, its music, and the quiet pride its people take in living as they choose.

Gentle breezes carry the scent of dandelions across the lake — a gift, they say, from Barbatos, the Anemo God who watches over the city without ever demanding anything in return.');
INSERT INTO nations (id, slug, name, element, kicker, tagline, accent_color, sort_order, image_path, hero_alt, card_alt, meta_description, about_kicker, about_heading, about_body) VALUES (2, 'liyue', 'Liyue', 'Geo', 'The nation of contracts', 'A land of stone, trade, and mountain-held secrets.', '#e7bd69', 2, 'assets/img/liyue.jpeg', 'Liyue Harbor and the steep cliffs of Liyue under warm evening light', 'Warm sunset over the rocky peaks and valleys of Liyue', 'Explore Liyue, the trade heart of Teyvat where sea routes, mountain passes, and age-old contracts define the region.', 'The nation of contracts', 'A harbor kingdom rooted in stone', 'Liyue sits where the sea meets the mountains, where harbor trade and ancient myth have shaped one another for centuries. The bright bustle of Liyue Harbor moves with merchants, sailors, and travelers from every corner of Teyvat, while the peaks above it keep the stories of older kingdoms alive.

Under Morax, Liyue became known for its discipline, prosperity, and sense of order. Every cliff, terrace, and caravan route tells a story of labor, faith, and survival — a landscape as exacting as it is beautiful.');
INSERT INTO nations (id, slug, name, element, kicker, tagline, accent_color, sort_order, image_path, hero_alt, card_alt, meta_description, about_kicker, about_heading, about_body) VALUES (3, 'inazuma', 'Inazuma', 'Electro', 'The nation of eternity', 'A realm of thunder, shrine rituals, and sea-swept islands.', '#c59bed', 3, 'assets/img/inazuma.webp', 'Narukami Island and the high cliffs of Inazuma under a purple storm-light sky', 'Inazuma''s island architecture framed by glowing cherry blossoms', 'Explore Inazuma, the island realm of thunder, shrines, and the eternal will of the Raiden Shogun.', 'The nation of eternity', 'An island realm shaped by thunder and memory', 'Inazuma is an island nation set apart by the force of its storms and the discipline of its traditions. The landscape shifts between sky-etched mountain ridges, shrine-filled forests, and coastal settlements where the tension between rule and rebellion still hangs in the air.

At the heart of the realm stands the Raiden Shogun, whose long rule has shaped life across Inazuma. Every path through the islands carries a sense of history — of old gods, military conflict, and a pursuit of eternity that continues to divide and define the people.');
  -- NOTE: meta description is a placeholder in the original page; improve it later
INSERT INTO nations (id, slug, name, element, kicker, tagline, accent_color, sort_order, image_path, hero_alt, card_alt, meta_description, about_kicker, about_heading, about_body) VALUES (4, 'sumeru', 'Sumeru', 'Dendro', 'THE NATION OF WISDOM', 'From halls of learning to the heart of the rainforest.', '#a6d46c', 4, 'assets/img/sumeru.webp', 'Sumeru City Academy rising among ancient rainforest trees', 'A great tree rises above Sumeru''s green hills and waterfalls', 'The Sumeru destination page for Teyvat Travels.', 'THE CITY OF WISDOM', 'Where scholars meet the rainforest', 'Sumeru is a nation of two worlds: dense, mystical rainforest canopies on one side and the vast desert on the other, linked by a long tradition of scholarship.

From the lecture halls of its great academy to the caravan routes at its frontier, every stop in Sumeru is an invitation to learn something new.');
INSERT INTO nations (id, slug, name, element, kicker, tagline, accent_color, sort_order, image_path, hero_alt, card_alt, meta_description, about_kicker, about_heading, about_body) VALUES (5, 'fontaine', 'Fontaine', 'Hydro', 'THE NATION OF JUSTICE', 'A city of justice and stagecraft beside the sea.', '#7ed9e7', 5, 'assets/img/fontaine.webp', 'The Palais Mermonia rising above Fontaine''s elegant city streets', 'The luminous towers and blue waters of Fontaine', 'Explore Fontaine, the nation of justice, grand performances, and elegant waterways.', 'THE CITY OF JUSTICE', 'A city of law, art and water', 'Fontaine is a city-state built around water, where elegant streets, aquabuses and grand courtrooms share the same shoreline. Its people take pride in order, fairness and a good performance.

From the courts above the city to the stage below, every corner of Fontaine is designed to be seen, judged and remembered.');
INSERT INTO nations (id, slug, name, element, kicker, tagline, accent_color, sort_order, image_path, hero_alt, card_alt, meta_description, about_kicker, about_heading, about_body) VALUES (6, 'natlan', 'Natlan', 'Pyro', 'The land of ash and valor', 'A land of volcanoes, hot springs, and vibrant tribal festivals.', '#ff936d', 6, 'assets/img/natlan.webp', 'The volcanic landscape of Natlan under a fiery sky', 'Natlan''s sunlit volcanic plains and distant mesas', 'Explore Natlan, the land of ash, hot springs, and valor in Teyvat, with Tepecac Stadium, Children of the Echoes Canyon, and the People of the Springs basin.', 'The land of ash and valor', 'A nation shaped by fire', 'Natlan is a land of dramatic volcanic terrain, where ash-covered ridges meet glowing craters. Its communities gather often for celebrations, dances, and contests of strength.

The nation is also famous for its thermal springs, whose warm waters are said to restore both body and spirit after a long journey through the highlands.');
INSERT INTO nations (id, slug, name, element, kicker, tagline, accent_color, sort_order, image_path, hero_alt, card_alt, meta_description, about_kicker, about_heading, about_body) VALUES (7, 'snezhnaya', 'Snezhnaya', 'Cryo', 'The land beneath the snow', 'A frozen northern nation of palaces, aurora, and endless winter.', '#a6ddf3', 7, 'assets/img/snezhnaya.webp', 'Snezhnaya''s palace city crowned with light beneath a glowing aurora', 'A frozen Snezhnaya skyline beneath a deep blue, starry sky', 'Explore Snezhnaya, the frozen northern nation of Teyvat, with the Zapolyarny Palace outskirts, Frost-bound Valleys, and Glacial Outposts.', 'The land beneath the snow', 'A kingdom of ice and light', 'Snezhnaya lies in the far north of Teyvat, where snow covers the land for most of the year. Its grand palaces and frosted towers rise above valleys wrapped in ice, and the sky often glows with the aurora.

Despite the cold, the nation is known for its architecture, its winter festivals, and the warm alpine chalets that keep travelers comfortable under the stars.');

-- ---------------- nation_facts (Quick Facts) ----------------
INSERT INTO nation_facts (nation_id, label, value, sort_order) VALUES (1, 'Element', 'Anemo (Wind)', 1);
INSERT INTO nation_facts (nation_id, label, value, sort_order) VALUES (1, 'Archon', 'Barbatos, God of Freedom', 2);
INSERT INTO nation_facts (nation_id, label, value, sort_order) VALUES (1, 'Region type', 'Lakeside island city', 3);
INSERT INTO nation_facts (nation_id, label, value, sort_order) VALUES (1, 'Best time to visit', 'Spring or autumn', 4);
INSERT INTO nation_facts (nation_id, label, value, sort_order) VALUES (2, 'Element', 'Geo (Stone)', 1);
INSERT INTO nation_facts (nation_id, label, value, sort_order) VALUES (2, 'Archon', 'Morax / Rex Lapis, God of Contracts', 2);
INSERT INTO nation_facts (nation_id, label, value, sort_order) VALUES (2, 'Region type', 'Harbor and mountain region', 3);
INSERT INTO nation_facts (nation_id, label, value, sort_order) VALUES (2, 'Best time to visit', 'Spring to early autumn', 4);
INSERT INTO nation_facts (nation_id, label, value, sort_order) VALUES (3, 'Element', 'Electro (Lightning)', 1);
INSERT INTO nation_facts (nation_id, label, value, sort_order) VALUES (3, 'Archon', 'Baal / Raiden Shogun, God of Eternity', 2);
INSERT INTO nation_facts (nation_id, label, value, sort_order) VALUES (3, 'Region type', 'Island archipelago and shrine region', 3);
INSERT INTO nation_facts (nation_id, label, value, sort_order) VALUES (3, 'Best time to visit', 'Late spring to early autumn', 4);
INSERT INTO nation_facts (nation_id, label, value, sort_order) VALUES (4, 'Element', 'Dendro', 1);
INSERT INTO nation_facts (nation_id, label, value, sort_order) VALUES (4, 'Archon', 'Nahida, Dendro Archon', 2);
INSERT INTO nation_facts (nation_id, label, value, sort_order) VALUES (4, 'Region type', 'Rainforest and desert nation', 3);
INSERT INTO nation_facts (nation_id, label, value, sort_order) VALUES (4, 'Best time to visit', 'Year-round, mornings for the rainforest', 4);
INSERT INTO nation_facts (nation_id, label, value, sort_order) VALUES (5, 'Element', 'Hydro', 1);
INSERT INTO nation_facts (nation_id, label, value, sort_order) VALUES (5, 'Archon', 'Focalors, Hydro Archon', 2);
INSERT INTO nation_facts (nation_id, label, value, sort_order) VALUES (5, 'Region type', 'Hydro city-state', 3);
INSERT INTO nation_facts (nation_id, label, value, sort_order) VALUES (5, 'Best time to visit', 'Year-round, evenings for performances', 4);
INSERT INTO nation_facts (nation_id, label, value, sort_order) VALUES (6, 'Element', 'Pyro (Fire)', 1);
INSERT INTO nation_facts (nation_id, label, value, sort_order) VALUES (6, 'Region type', 'Volcanic highland nation', 2);
INSERT INTO nation_facts (nation_id, label, value, sort_order) VALUES (6, 'Known for', 'Hot springs and tribal festivals', 3);
INSERT INTO nation_facts (nation_id, label, value, sort_order) VALUES (6, 'Best time to visit', 'Dry season, for clear skies', 4);
INSERT INTO nation_facts (nation_id, label, value, sort_order) VALUES (7, 'Element', 'Cryo (Ice)', 1);
INSERT INTO nation_facts (nation_id, label, value, sort_order) VALUES (7, 'Archon', 'The Tsaritsa, Goddess of Winter', 2);
INSERT INTO nation_facts (nation_id, label, value, sort_order) VALUES (7, 'Region type', 'Frozen northern nation', 3);
INSERT INTO nation_facts (nation_id, label, value, sort_order) VALUES (7, 'Best time to visit', 'Winter, for the aurora', 4);

-- ---------------- packages (homepage version is used) ----------------
-- CONFLICTS FOUND between homepage cards and nation pages (homepage wins here):
--   Liyue   title : nation page says 'The Harbor of Stone and Contracts'
--   Liyue   desc  : 'Travel through the trade routes, sacred peaks, and festival-lit harbor streets of Liyue — a journey where commerce and myth sit side by side.'
--   Liyue   stops : 'Liyue Harbor', 'Mt. Tianheng', 'Qingce Village'
--   Inazuma desc  : 'Follow the thunder trails of Inazuma through shrine towns, storm-swept beaches, and island settlements shaped by old legends and modern rule.'
--   Inazuma stops : 'Ritou', 'Inazuma City', 'Grand Narukami Shrine'
--   Mondstadt stop: homepage had 'the grand Cathedral of Mondstadt' (typo, fixed below)
INSERT INTO packages (id, nation_id, title, description, price_php, days, nights, badge, is_featured, is_active, sort_order) VALUES (1, 1, 'The City of Freedom Expedition', 'Experience the romantic charm of windmills, rolling green hills, and historic stone architecture. Perfect for travelers looking for a relaxing nature getaway.', 12500, 3, 2, 'Most popular', 1, 1, 1);
INSERT INTO packages (id, nation_id, title, description, price_php, days, nights, badge, is_featured, is_active, sort_order) VALUES (2, 2, 'The Harbor of Stone and Commerce', 'A bustling port city tour blending breathtaking mountain ranges, ancient folklore, and world-class culinary adventures.', 15000, 4, 3, 'Harbor & heritage', 0, 1, 2);
INSERT INTO packages (id, nation_id, title, description, price_php, days, nights, badge, is_featured, is_active, sort_order) VALUES (3, 3, 'The Realm of Eternal Thunder', 'Discover a culturally rich archipelago featuring striking purple foliage, traditional shrines, and serene coastal views.', 18000, 4, 3, 'Island escape', 0, 1, 3);
INSERT INTO packages (id, nation_id, title, description, price_php, days, nights, badge, is_featured, is_active, sort_order) VALUES (4, 4, 'The City of Wisdom & Rainforest Retreat', 'A dual-environment journey taking you from the majestic halls of learning to the dense, mystical canopies of the rainforest.', 14000, 3, 3, 'Rainforest retreat', 0, 1, 4);
INSERT INTO packages (id, nation_id, title, description, price_php, days, nights, badge, is_featured, is_active, sort_order) VALUES (5, 5, 'The Capital of Justice, Steam, and Aquanics', 'Step into a picturesque hub of art, fashion, and advanced clockwork engineering surrounded by pristine waters.', 20000, 5, 4, 'Arts & innovation', 0, 1, 5);
INSERT INTO packages (id, nation_id, title, description, price_php, days, nights, badge, is_featured, is_active, sort_order) VALUES (6, 6, 'The Land of Ash, Hot Springs, and Valor', 'An energetic adventure featuring dramatic volcanic landscapes, therapeutic thermal springs, and vibrant tribal festivals.', 16500, 4, 3, 'Volcanic adventure', 0, 1, 6);
INSERT INTO packages (id, nation_id, title, description, price_php, days, nights, badge, is_featured, is_active, sort_order) VALUES (7, 7, 'The Eternal White Tundra', 'A majestic winter expedition exploring frosted architectural marvels, grand palaces, and cozy alpine chalets under the aurora.', 22000, 5, 4, 'Winter expedition', 0, 1, 7);

-- ---------------- package_stops ----------------
INSERT INTO package_stops (package_id, name, sort_order) VALUES (1, 'Cider Lake', 1);
INSERT INTO package_stops (package_id, name, sort_order) VALUES (1, 'Windrise', 2);
INSERT INTO package_stops (package_id, name, sort_order) VALUES (1, 'The Grand Cathedral of Mondstadt', 3);
INSERT INTO package_stops (package_id, name, sort_order) VALUES (2, 'Liyue Harbor', 1);
INSERT INTO package_stops (package_id, name, sort_order) VALUES (2, 'Mt. Aocang', 2);
INSERT INTO package_stops (package_id, name, sort_order) VALUES (2, 'Wangshu Inn', 3);
INSERT INTO package_stops (package_id, name, sort_order) VALUES (3, 'Narukami Island Grand Shrine', 1);
INSERT INTO package_stops (package_id, name, sort_order) VALUES (3, 'Ritou Trading Port', 2);
INSERT INTO package_stops (package_id, name, sort_order) VALUES (3, 'Tenshukaku', 3);
INSERT INTO package_stops (package_id, name, sort_order) VALUES (4, 'Sumeru City Academy', 1);
INSERT INTO package_stops (package_id, name, sort_order) VALUES (4, 'Gandharva Ville', 2);
INSERT INTO package_stops (package_id, name, sort_order) VALUES (4, 'Caravan Ribat', 3);
INSERT INTO package_stops (package_id, name, sort_order) VALUES (5, 'Court of Fontaine', 1);
INSERT INTO package_stops (package_id, name, sort_order) VALUES (5, 'Opera Epiclese', 2);
INSERT INTO package_stops (package_id, name, sort_order) VALUES (5, 'Lucine Fountain', 3);
INSERT INTO package_stops (package_id, name, sort_order) VALUES (6, 'Tepecac Stadium', 1);
INSERT INTO package_stops (package_id, name, sort_order) VALUES (6, 'Children of the Echoes Canyon', 2);
INSERT INTO package_stops (package_id, name, sort_order) VALUES (6, 'People of the Springs basin', 3);
INSERT INTO package_stops (package_id, name, sort_order) VALUES (7, 'Zapolyarny Palace outskirts', 1);
INSERT INTO package_stops (package_id, name, sort_order) VALUES (7, 'Frost-bound Valleys', 2);
INSERT INTO package_stops (package_id, name, sort_order) VALUES (7, 'Glacial Outposts', 3);

-- ---------------- faqs ----------------
INSERT INTO faqs (question, answer, sort_order, is_published) VALUES ('Is Teyvat Travels an official service?', 'No. Teyvat Travels is an unofficial fan project by Skill Issue Inc. and is not affiliated with or endorsed by HoYoverse.', 1, 1);
INSERT INTO faqs (question, answer, sort_order, is_published) VALUES ('Can I book a real-world trip through the site?', 'No. Teyvat is a fictional world, and this site is a fan-made guide. It does not sell travel or booking services.', 2, 1);
INSERT INTO faqs (question, answer, sort_order, is_published) VALUES ('Where should I begin exploring?', 'Start with the nation that interests you most in the Packages section, then use its guide to explore local highlights and routes.', 3, 1);
INSERT INTO faqs (question, answer, sort_order, is_published) VALUES ('How can I contact Skill Issue Inc.?', 'Email the team at skillissueinc@gmail.com.', 4, 1);

-- ---------------- director_profile ----------------
INSERT INTO director_profile (id, name, title, bio, photo_path, photo_alt) VALUES (1, 'Charles Paule', 'Managing Director', 'Charles Paule leads Skill Issue Inc. with a commitment to making every journey through Teyvat clear, welcoming, and memorable. Charles brings together the researchers, writers, designers, and developers who create trustworthy guides for travelers across all seven nations. Charles believes thoughtful planning should make room for discovery, helping every Traveller explore with confidence.', 'assets/img/director.jpg', 'Charles Paule, Managing Director');

-- ---------------- single Director admin account ----------------
INSERT INTO users (name, email, password_hash, role)
VALUES (
  'Charles Paule',
  'johnreylunar02@gmail.com',
  '$2y$10$ip/dXy6GQyBBrJ2p46oo3e6pXy4UcM2yE6VUs1r519yRudgrQqsaS',
  'admin'
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password_hash = VALUES(password_hash),
  role = 'admin';

-- ---------------- locations ----------------
INSERT INTO locations (nation_id, name, image_path, image_alt, description, tag, sort_order) VALUES
 (1, 'Cider Lake', 'images/mondstadt/cider lake.jpg', 'Crystal-clear Cider Lake encircling Mondstadt', 'A natural freshwater lake around Mondstadt whose clear waters are the source of the nation''s famous ciders and wines.', 'Best for: Scenery', 1),
 (1, 'Windrise', 'images/mondstadt/windrise.webp', 'A huge oak tree at Windrise', 'A windswept hill crowned by a great oak tree associated with Vennessa and the Four Winds.', 'Best for: Relaxing', 2),
 (1, 'Grand Cathedral of Mondstadt', 'images/mondstadt/Grand Cathedral of Mondstadt (1).webp', 'The Grand Cathedral of Mondstadt', 'The city''s landmark Church of Favonius, also known as Favonius Cathedral.', 'Best for: Architecture', 3),
 (2, 'Liyue Harbor', 'images/liyue/Harbor.png', 'Liyue Harbor beneath stone cliffs', 'The bustling merchant harbor at the heart of Liyue, famous for trade, lanterns, and the Rite of Descension.', 'Best for: Shopping and culture', 1),
 (2, 'Mt. Aocang', 'images/liyue/Mt. Aocang.png', 'Mt. Aocang rising above the clouds', 'A mist-shrouded mountain domain associated with the adeptus Cloud Retainer.', 'Best for: Mountain scenery', 2),
 (2, 'Wangshu Inn', 'images/liyue/Wangshu Inn.png', 'Wangshu Inn overlooking Dihua Marsh', 'A distinctive inn built around a golden-leaved tree above Dihua Marsh.', 'Best for: Views', 3),
 (3, 'Narukami Island Grand Shrine', 'images/Inazuma/Grand Narukami Shrine.jpg', 'Grand Narukami Shrine', 'A sacred shrine on Mt. Yougou known for cherry blossoms and spiritual traditions.', 'Best for: Shrines', 1),
 (3, 'Ritou Trading Port', 'images/Inazuma/Ritou.jpg', 'Ritou Trading Port', 'An island gateway where merchants, ferries, and travelers begin their journey in Inazuma.', 'Best for: Culture', 2),
 (3, 'Tenshukaku', 'images/Inazuma/Tenshukaku.png', 'Tenshukaku overlooking Inazuma City', 'The imposing seat of authority in Inazuma City.', 'Best for: History', 3),
 (4, 'Sumeru City Academy', 'images/sumeru/Sumeru Academy.png', 'Sumeru City Academy', 'The renowned center of scholarship rising among Sumeru''s forests.', 'Best for: Learning', 1),
 (4, 'Gandharva Ville', 'images/sumeru/gandharva%20ville.jpg', 'Gandharva Ville', 'A peaceful rainforest settlement connected by elevated walkways and treetop paths.', 'Best for: Rainforest', 2),
 (4, 'Caravan Ribat', 'images/sumeru/caravan%20ribat.jpg', 'Caravan Ribat', 'A frontier stop linking Sumeru''s rainforest with the desert beyond.', 'Best for: Adventure', 3),
 (5, 'Court of Fontaine', 'images/fontaine/court of fontaine.jpg', 'The Court of Fontaine', 'An elegant city of courts, waterways, performances, and clockwork innovation.', 'Best for: Architecture', 1),
 (5, 'Opera Epiclese', 'images/fontaine/Opera Epiclese.jpg', 'Opera Epiclese', 'Fontaine''s grand opera house and a stage for major ceremonies and performances.', 'Best for: Performances', 2),
 (5, 'Lucine Fountain', 'images/fontaine/Lucine Fountain.webp', 'Lucine Fountain', 'A luminous central fountain framing the capital''s elegant public spaces.', 'Best for: Evening views', 3),
 (6, 'Tepecac Stadium', 'images/natlan/natlan_tepecac_stadium.jpg', 'Tepecac Stadium', 'A prominent arena for contests and community celebrations in Natlan.', 'Best for: Festivals', 1),
 (6, 'Children of the Echoes Canyon', 'images/natlan/natlan_echoes_canyon.webp', 'Echoes Canyon', 'A dramatic canyon shaped by cliffs, echoing terrain, and tribal history.', 'Best for: Hiking', 2),
 (6, 'People of the Springs Basin', 'images/natlan/natlan_springs_basin.webp', 'People of the Springs Basin', 'A restorative valley settlement known for warm pools and mountain views.', 'Best for: Hot springs', 3),
 (7, 'Zapolyarny Palace Outskirts', 'images/snezhnaya/snezhnaya_palace.jpg', 'Zapolyarny Palace Outskirts', 'The snow-covered approaches to Snezhnaya''s most imposing royal complex.', 'Best for: Architecture', 1),
 (7, 'Frost-bound Valleys', 'images/snezhnaya/snezhnaya_valleys.jpg', 'Frost-bound Valleys', 'Wide northern valleys filled with ice, aurora light, and winter forests.', 'Best for: Scenery', 2),
 (7, 'Glacial Outposts', 'images/snezhnaya/snezhnaya_outposts.jpg', 'Glacial Outposts', 'Remote frontier settlements adapted to snow and severe cold.', 'Best for: Winter travel', 3);

-- ---------------- tips ----------------
INSERT INTO tips (nation_id, title, body, icon, sort_order) VALUES
 (1, 'Where to stay', 'Stay near Mondstadt''s main square for easy access to shops, dining, and nearby city landmarks.', 'tip-stay', 1),
 (1, 'What to eat and drink', 'Try local cider, Dandelion Wine, and slow-smoked dishes associated with Springvale.', 'tip-food', 2),
 (1, 'Getting around', 'Use open paths and the gentle wind routes to reach Cider Lake, Windrise, and the city center.', 'tip-travel', 3),
 (2, 'Where to stay', 'Base your visit in Liyue Harbor for transport, markets, and the widest range of dining options.', 'tip-stay', 1),
 (2, 'What to eat', 'Sample regional staples inspired by the harbor markets, mountain herbs, and fresh seafood.', 'tip-food', 2),
 (2, 'Getting around', 'Start at the harbor, then plan mountain routes separately because paths can be steep and time-consuming.', 'tip-travel', 3),
 (3, 'Where to stay', 'Stay near Inazuma City or Ritou for convenient access to ferries and shrine routes.', 'tip-stay', 1),
 (3, 'What to eat', 'Look for local seafood, rice dishes, and traditional sweets in island settlements.', 'tip-food', 2),
 (3, 'Getting around', 'Allow extra time for island travel and changing weather during storm season.', 'tip-travel', 3),
 (4, 'Where to stay', 'Stay near Sumeru City for fast access to the Academy and rainforest routes.', 'tip-stay', 1),
 (4, 'What to see', 'Plan both a rainforest walk and a desert excursion for a complete view of Sumeru.', 'tip-travel', 2),
 (4, 'Getting around', 'Carry water and begin rainforest walks early while temperatures are cooler.', 'tip-travel', 3),
 (5, 'Where to stay', 'Choose lodging near the Court of Fontaine for central access to courts and waterfront transit.', 'tip-stay', 1),
 (5, 'What to see', 'Reserve time for a performance and explore the public fountains around the city.', 'tip-travel', 2),
 (5, 'Getting around', 'Use the aquabus network for relaxed travel along Fontaine''s waterways.', 'tip-travel', 3),
 (6, 'Where to stay', 'Stay near the People of the Springs basin for easy access to hot pools and trails.', 'tip-stay', 1),
 (6, 'What to eat', 'Try regional meals centered around hearty mountain ingredients and local festive flavors.', 'tip-food', 2),
 (6, 'Getting around', 'Allow time for volcanic terrain and schedule outdoor routes during the dry season.', 'tip-travel', 3),
 (7, 'Where to stay', 'Use an alpine chalet near the glacial outposts for warmth and aurora viewing.', 'tip-stay', 1),
 (7, 'What to pack', 'Bring insulated layers, waterproof boots, gloves, and clothing suitable for strong winds.', 'tip-travel', 2),
 (7, 'Getting around', 'Plan shorter outdoor segments and check conditions before crossing snowbound routes.', 'tip-travel', 3);