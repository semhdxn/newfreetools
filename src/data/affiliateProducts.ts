/**
 * Static Amazon Associates product catalogue (amazon.co.uk, tag `zumboutf-21`).
 *
 * There is no backend here, so — unlike the paid toolkit — there is no
 * PA-API live price/image lookup and no admin-curated product table. Every
 * product below is static: an ASIN links straight to that product page, and
 * everything else links to a tagged Amazon search for its title.
 *
 * Never shown on the Pupil Voice route — see src/lib/adConfig.ts.
 */

const ASSOCIATE_TAG = 'zumboutf-21';

export interface AffiliateProduct {
  id: string;
  areaId: string;
  title: string;
  description: string;
  asin?: string;
}

export function productUrl(product: AffiliateProduct): string {
  if (product.asin) {
    return `https://www.amazon.co.uk/dp/${product.asin}?tag=${ASSOCIATE_TAG}`;
  }
  return `https://www.amazon.co.uk/s?k=${encodeURIComponent(product.title)}&tag=${ASSOCIATE_TAG}`;
}

let idCounter = 0;
function area(
  areaId: string,
  items: { title: string; description: string; asin?: string }[],
): AffiliateProduct[] {
  return items.map((item) => ({ id: `aff-${(idCounter += 1)}`, areaId, ...item }));
}

export const affiliateProducts: AffiliateProduct[] = [
  ...area('hearing-over', [
    { title: 'Ear Defenders', description: 'Noise-reducing ear defenders for sound sensitivity', asin: 'B07RW6Z692' },
    { title: 'Loop Earplugs', description: 'Discreet earplugs that reduce noise without blocking it', asin: 'B08FBJ4F4S' },
    { title: 'White Noise Machine', description: 'Soothing background sounds to mask overwhelming noise' },
  ]),
  ...area('hearing-under', [
    { title: 'Musical Instruments Set', description: 'Multi-instrument set to encourage auditory engagement' },
    { title: 'Sound-Making Toys', description: 'Interactive toys that produce a variety of sounds' },
    { title: 'Bluetooth Speaker', description: 'Portable speaker for music and auditory stimulation' },
  ]),
  ...area('hearing-seeking', [
    { title: 'Rainstick', description: 'Calming rain sounds in a handheld instrument' },
    { title: 'Music Headphones', description: 'Comfortable headphones for immersive listening' },
    { title: 'Sound Board', description: 'Interactive sound board with buttons and effects' },
  ]),
  ...area('visual-over', [
    { title: 'Blackout Curtains', description: 'Block out bright light for a calmer environment' },
    { title: 'Blue Light Glasses', description: 'Reduce visual strain from screens and bright lights', asin: 'B07PNQ2BS9' },
    { title: 'Warm Desk Lamp', description: 'Soft warm-toned lighting to reduce visual overload' },
  ]),
  ...area('visual-under', [
    { title: 'Light-Up Toys', description: 'Bright, colourful toys for visual stimulation' },
    { title: 'Lava Lamp', description: 'Mesmerising moving light for visual engagement' },
    { title: 'LED Strip Lights', description: 'Colourful lights to brighten and stimulate the environment' },
  ]),
  ...area('visual-seeking', [
    { title: 'Fibre Optic Lamp', description: 'Captivating light display for visual seekers' },
    { title: 'Glitter Jar', description: 'Calming visual tool with swirling glitter', asin: 'B0BR5HCP9X' },
    { title: 'Kaleidoscope', description: 'Ever-changing patterns for visual exploration' },
  ]),
  ...area('olfactory-over', [
    { title: 'Unscented Products Set', description: 'Fragrance-free essentials for sensitive noses' },
    { title: 'Nose Clips', description: 'Block strong smells during overwhelming moments' },
  ]),
  ...area('olfactory-under', [
    { title: 'Scratch & Sniff Books', description: 'Interactive books with scented pages' },
    { title: 'Scented Playdough', description: 'Play dough with engaging scents' },
  ]),
  ...area('olfactory-seeking', [
    { title: 'Essential Oils Set', description: 'A range of scents for olfactory exploration' },
  ]),
  ...area('gustatory-over', [
    { title: 'Flavour-Free Toothpaste', description: 'Gentle toothpaste without strong flavours' },
  ]),
  ...area('gustatory-under', [
    { title: 'Spice Kit', description: 'Explore different smells and tastes through spices' },
  ]),
  ...area('gustatory-seeking', [
    { title: 'Chewable Jewellery', description: 'Safe chew necklaces for oral sensory needs' },
    { title: 'Flavoured Lip Balm', description: 'Tasty lip balms for oral sensory input' },
  ]),
  ...area('tactile-over', [
    { title: 'Seamless Socks', description: 'Socks without irritating seams for sensitive skin' },
    { title: 'Tagless Clothing', description: 'Soft, tag-free clothes to reduce tactile discomfort' },
    { title: 'Soft Blanket', description: 'Ultra-soft blanket for comforting touch', asin: 'B09JLP3R7Y' },
  ]),
  ...area('tactile-under', [
    { title: 'Textured Sensory Toys', description: 'Variety of textures to explore through touch' },
    { title: 'Vibrating Pillow', description: 'Gentle vibrations for tactile awareness' },
    { title: 'Massage Ball', description: 'Textured ball for tactile stimulation' },
  ]),
  ...area('tactile-seeking', [
    { title: 'Fidget Toys Pack', description: 'Assorted fidget toys for tactile seekers', asin: 'B08L5VG843' },
    { title: 'Kinetic Sand', description: 'Satisfying mouldable sand for hands-on play', asin: 'B00CIGMG7C' },
    { title: 'Sensory Bin Kit', description: 'Complete kit for tactile exploration activities' },
  ]),
  ...area('vestibular-over', [
    { title: 'Wobble Cushion', description: 'Gentle movement support for seated balance' },
    { title: 'Supportive Seat', description: 'Stable seating to reduce vestibular discomfort' },
    { title: 'Anti-Nausea Bands', description: 'Wristbands to help with motion sensitivity' },
  ]),
  ...area('vestibular-under', [
    { title: 'Indoor Swing', description: 'Safe indoor swing for vestibular input' },
    { title: 'Balance Board', description: 'Wooden balance board for movement play' },
    { title: 'Rocking Chair', description: 'Gentle rocking motion for vestibular stimulation' },
  ]),
  ...area('vestibular-seeking', [
    { title: 'Trampoline', description: 'Mini trampoline for bouncing and movement' },
    { title: 'Spinning Seat', description: 'Sit-and-spin for rotational vestibular input' },
    { title: 'Skateboard', description: 'Beginner skateboard for movement seekers' },
  ]),
  ...area('proprioception-under', [
    { title: 'Weighted Blanket', description: 'Deep pressure input for body awareness', asin: 'B07RJP1VZG' },
    { title: 'Resistance Bands', description: 'Stretchy bands for proprioceptive feedback' },
    { title: 'Body Sock', description: 'Stretchy full-body sock for deep pressure', asin: 'B07PJG4Q3W' },
  ]),
  ...area('proprioception-seeking', [
    { title: 'Compression Vest', description: 'Gentle compression for calming proprioceptive input' },
    { title: 'Chew Toys', description: 'Safe chew tools for oral proprioceptive input', asin: 'B07TPP7XQF' },
    { title: 'Therapy Putty', description: 'Resistive putty for hand strengthening and input', asin: 'B003U6T0VG' },
  ]),
  ...area('interoception-over', [
    { title: 'Breathing Exercise Cards', description: 'Visual guides for calming breathing techniques' },
    { title: 'Calm-Down Kit', description: 'Tools and activities to manage overwhelming feelings', asin: 'B08NJL69QS' },
    { title: 'Weighted Lap Pad', description: 'Portable deep pressure for calming on the go', asin: 'B07KX6N9DG' },
  ]),
  ...area('interoception-under', [
    { title: 'Feelings Flashcards', description: 'Cards to help identify and name body signals' },
    { title: 'Body Awareness Workbook', description: 'Activities to build interoceptive awareness' },
    { title: 'Visual Timer', description: 'Visual countdown timer for routine and body cues', asin: 'B07GBQ3KSP' },
  ]),

  // Home Behaviour Questionnaire — one product per hbq-* key; each category
  // in homeBehaviourData.ts already lists which keys it pulls together via
  // its `productIds` field.
  ...area('hbq-emo-1', [{ title: 'Anger Gremlin Workbook', description: 'A child-friendly workbook for understanding and managing anger' }]),
  ...area('hbq-emo-2', [{ title: 'My Hidden Chimp', description: 'Helps children manage thoughts, behaviours and emotions' }]),
  ...area('hbq-emo-3', [{ title: 'Building Resilience in Children', description: 'Practical strategies for raising resilient children and teens' }]),
  ...area('hbq-mh-1', [{ title: 'Conversations That Matter', description: 'Talking with children and teenagers in ways that help' }]),
  ...area('hbq-selfe-1', [{ title: '31 Ways to Champion Children', description: 'Helping children develop high self-esteem' }]),
  ...area('hbq-selfe-2', [{ title: 'Feeling Better — CBT Workbook for Teens', description: 'Manage moods, boost self-esteem and conquer anxiety' }]),
  ...area('hbq-selfe-3', [{ title: 'HappySelf Journal (6–12)', description: 'Daily journal that promotes happiness and positive habits' }]),
  ...area('hbq-phy-1', [{ title: 'Helping Busy Brains Settle', description: 'Calming routines and bedtime support' }]),
  ...area('hbq-phy-2', [{ title: 'Cooking Breakfast with Kids', description: 'Easy breakfast recipes to involve children' }]),
  ...area('hbq-phy-3', [{ title: "Supporting Children's Emotional Wellbeing", description: 'Wellbeing strategies that support physical health too' }]),
  ...area('hbq-worry-1', [{ title: 'No Worries! Mindful Kids Activity Book', description: 'Activities for children who feel anxious or stressed' }]),
  ...area('hbq-worry-2', [{ title: 'My Emotions Journal (Kids & Teens)', description: 'Daily emotion log and reflection' }]),
  ...area('hbq-worry-3', [{ title: 'Simple Guide to Attachment', description: 'Understanding attachment, separation and reassurance' }]),
  ...area('hbq-sen-1', [{ title: 'Sensory Processing Explained', description: 'Handbook for parents and educators' }]),
  ...area('hbq-sen-2', [{ title: 'Weighted Blanket', description: 'Calming deep-pressure input', asin: 'B07RJP1VZG' }]),
  ...area('hbq-sen-3', [{ title: 'Fidget Toys Pack', description: 'Variety pack for tactile sensory needs', asin: 'B08L5VG843' }]),
  ...area('hbq-learn-1', [{ title: 'Nurture Activities Book', description: 'Activities for children who need extra nurture support' }]),
  ...area('hbq-learn-2', [{ title: 'Visual Timer', description: 'Helps with focus and transitions between tasks', asin: 'B07GBQ3KSP' }]),
  ...area('hbq-learn-3', [{ title: 'Reusable Visual Checklist', description: 'Wipe-clean daily routine and instruction checklist' }]),
  ...area('hbq-mood-1', [{ title: 'Creative Ways to Help Children Manage Big Feelings', description: "A therapist's guide for primary-aged children" }]),
  ...area('hbq-mood-2', [{ title: 'Overcoming Low Mood (Workbook)', description: 'Practical CBT-style activities for low mood' }]),
  ...area('hbq-mood-3', [{ title: 'The Art of Being a Brilliant Teenager', description: 'Mindset and motivation for teenagers' }]),
  ...area('hbq-soc-1', [{ title: 'Social Stories Book', description: 'Story-based teaching of social situations' }]),
  ...area('hbq-soc-2', [{ title: 'Social Skills Activities for Kids', description: 'Activity book for friendship and social skills' }]),

  // Behaviour (School) — keyed off `behaviour-${functionId}`.
  ...area('behaviour-attention', [
    { title: 'Visual Timer', description: 'Helps focus and signal time on task', asin: 'B07GBQ3KSP' },
    { title: 'Token Reward Chart', description: 'Reusable chart to recognise positive behaviour' },
    { title: 'Feelings Flashcards', description: 'Cards for naming feelings during 1:1 time' },
  ]),
  ...area('behaviour-control', [
    { title: 'Now & Next Board', description: 'Visual structure that gives a clear sense of what comes next' },
    { title: 'Reusable Visual Checklist', description: 'Wipe-clean daily routine and instruction checklist', asin: 'B07GBQ3KSP' },
    { title: 'Choice Board Cards', description: 'Picture cards offering controlled choices' },
  ]),
  ...area('behaviour-escape', [
    { title: 'Calm-Down Kit', description: 'Tools and activities to manage overwhelming feelings', asin: 'B08NJL69QS' },
    { title: 'Quiet Den Pop-Up Tent', description: 'Pop-up den providing a safe quiet space' },
    { title: 'Noise-Reducing Ear Defenders', description: 'Cuts overwhelming classroom noise', asin: 'B07RW6Z692' },
  ]),
  ...area('behaviour-sensory', [
    { title: 'Fidget Toys Pack', description: 'Assorted fidget toys for self-regulation', asin: 'B08L5VG843' },
    { title: 'Weighted Lap Pad', description: 'Portable deep pressure for calming on the go', asin: 'B07KX6N9DG' },
    { title: 'Chewable Jewellery', description: 'Safe chew necklaces for oral sensory needs', asin: 'B07TPP7XQF' },
  ]),
  ...area('behaviour-self-esteem', [
    { title: 'HappySelf Journal (6–12)', description: 'Daily journal that promotes positive habits' },
    { title: '31 Ways to Champion Children', description: 'Helping children develop high self-esteem' },
    { title: 'Confidence Activity Book', description: 'Activities that build self-confidence' },
  ]),

  // Pupil Voice — kept in the catalogue for completeness, but never rendered
  // anywhere: the whole route is excluded from ads/products, see adConfig.ts.
  ...area('voice-attention', [
    { title: 'Visual Timer', description: 'Supports focus and predictable transitions', asin: 'B07GBQ3KSP' },
    { title: 'Conversation Starter Cards', description: 'Prompts for unhurried 1:1 talking time' },
    { title: 'Mindful Listening Game', description: 'Listening and turn-taking activities' },
  ]),
  ...area('voice-control', [
    { title: 'Now & Next Board', description: 'Visual structure that gives a sense of what comes next', asin: 'B07GBQ3KSP' },
    { title: 'Choice Board Cards', description: 'Picture cards offering controlled choices' },
    { title: 'Decision Wheel', description: 'Spinner to help with small everyday choices' },
  ]),
  ...area('voice-escape', [
    { title: 'Calm-Down Kit', description: 'Tools to manage overwhelming feelings', asin: 'B08NJL69QS' },
    { title: 'Pop-Up Sensory Den', description: 'Quiet retreat space for breaks' },
    { title: 'Worry Monster Plush', description: 'Soft toy for posting written worries' },
  ]),
  ...area('voice-sensory', [
    { title: 'Fidget Toys Pack', description: 'Assorted fidget toys for self-regulation', asin: 'B08L5VG843' },
    { title: 'Ear Defenders', description: 'Noise-reducing ear defenders for sound sensitivity', asin: 'B07RW6Z692' },
    { title: 'Chewable Jewellery', description: 'Safe chew necklaces for oral sensory needs', asin: 'B07TPP7XQF' },
  ]),
];

export function getProductsForArea(areaId: string): AffiliateProduct[] {
  return affiliateProducts.filter((p) => p.areaId === areaId);
}

export function getProductsForAreas(areaIds: string[]): AffiliateProduct[] {
  return areaIds.flatMap((id) => getProductsForArea(id));
}
