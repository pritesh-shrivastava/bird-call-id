// BirdCLEF 2024 Western Ghats species (182 total).
// Labels match the competition's primary_label column from train_metadata.csv.
// Common names and descriptions are a representative subset; expand with full list after training.

export const SPECIES = {
  asiope1: { common: 'Malabar Grey Hornbill', scientific: 'Ocyceros griseus', desc: 'Endemic to the Western Ghats. Its loud cackling call is unmistakable in evergreen forests.' },
  bkfkin1: { common: 'Black-backed Kingfisher', scientific: 'Ceyx erithaca', desc: 'Gem-like tiny kingfisher of forest streams; rarely glimpsed.' },
  bltmun1: { common: 'Blue-tailed Bee-eater', scientific: 'Merops philippinus', desc: 'Brilliant turquoise and chestnut, hunts large insects in open country.' },
  brakit1: { common: 'Brahminy Kite', scientific: 'Haliastur indus', desc: 'Chestnut and white raptor, common over coasts and inland waters.' },
  comkig1: { common: 'Common Kingfisher', scientific: 'Alcedo atthis', desc: 'Electric-blue dart along rivers; shrill piping call.' },
  coopet1: { common: "Coppersmith Barbet", scientific: 'Psilopogon haemacephalus', desc: 'Monotonous "tuk-tuk-tuk" hammering from treetops all day.' },
  crfpri1: { common: 'Crimson-fronted Barbet', scientific: 'Psilopogon rubricapillus', desc: 'Western Ghats endemic with a red forehead and rollicking call.' },
  eurkig1: { common: 'Eurasian Kingfisher', scientific: 'Alcedo atthis', desc: 'Same species as Common Kingfisher — brilliant blue streak above clear water.' },
  gofbab1: { common: 'Golden-fronted Leafbird', scientific: 'Chloropsis aurifrons', desc: 'Vivid green with a golden forehead; superb mimic.' },
  grhfly1: { common: 'Grey-headed Canary-flycatcher', scientific: 'Culicicapa ceylonensis', desc: 'Pale grey head, yellow underparts; flicks wings and tail constantly.' },
  himbub1: { common: 'Himalayan Bulbul', scientific: 'Pycnonotus leucogenys', desc: 'White-cheeked bulbul of montane areas.' },
  iorbab1: { common: 'Indian Scimitar Babbler', scientific: 'Pomatorhinus horsfieldii', desc: 'Loud duets ring through dense Western Ghats undergrowth.' },
  indpea1: { common: 'Indian Peafowl', scientific: 'Pavo cristatus', desc: 'National bird of India; mournful "may-awe" call carries far.' },
  indpig1: { common: 'Indian Pitta', scientific: 'Pitta brachyura', desc: 'Rainbow jewel of the forest floor; two-note whistle heard at dawn.' },
  indrob1: { common: 'Indian Robin', scientific: 'Copsychus fulicatus', desc: 'Bold black and chestnut robin of open scrub; perky tail.' },
  junfow1: { common: 'Red Junglefowl', scientific: 'Gallus gallus', desc: 'Wild ancestor of domestic chicken; crowing male in dense forest.' },
  lrbkin1: { common: 'Large Blue Kingfisher', scientific: 'Alcedo hercules', desc: 'Rarer, larger version of common kingfisher along forest streams.' },
  malbab1: { common: 'Malabar Whistling Thrush', scientific: 'Myophonus horsfieldii', desc: 'Whistles human-like phrases at dawn on rocky stream banks.' },
  malpie1: { common: 'Malabar Pied Hornbill', scientific: 'Anthracoceros coronatus', desc: 'Large black-and-white hornbill with spectacular casque; loud "kek" calls.' },
  maswif1: { common: 'Malabar Starling', scientific: 'Sturnia blythii', desc: 'Pale-bodied starling endemic to the Western Ghats coast.' },
  moccha1: { common: 'Malabar Lark', scientific: 'Galerida malabarica', desc: 'Ground-lark of open laterite and grassland.' },
  nccpig1: { common: 'Nilgiri Wood Pigeon', scientific: 'Columba elphinstonii', desc: 'Endangered endemic of high-elevation shola forests.' },
  nilfly1: { common: 'Nilgiri Flycatcher', scientific: 'Eumyias albicaudatus', desc: 'Blue gem of the sholas; flicks tail, dashes for insects.' },
  nilthr1: { common: 'Nilgiri Thrush', scientific: 'Zoothera neilgherriensis', desc: 'Retiring scaly thrush of shola understory; rarely seen, often heard.' },
  oribab1: { common: 'Orange-billed Babbler', scientific: 'Argya rufescens', desc: 'Noisy endemic of Sri Lanka and southernmost Ghats forest edges.' },
  pycbul1: { common: 'Red-vented Bulbul', scientific: 'Pycnonotus cafer', desc: 'Cheerful and ubiquitous; red vent and noisy chatter.' },
  rubmun1: { common: 'Ruby-throated Bulbul', scientific: 'Rubigula dispar', desc: 'South Indian endemic with a red throat patch.' },
  shama1:  { common: 'White-rumped Shama', scientific: 'Copsychus malabaricus', desc: 'Legendary songster of bamboo and forest thickets.' },
  sikmyn1: { common: 'Tickell\'s Blue Flycatcher', scientific: 'Cyornis tickelliae', desc: 'Vivid blue and orange; sings beautifully in shaded forest.' },
  smtitl1: { common: 'Small Sunbird', scientific: 'Cinnyris minullus', desc: 'Tiny metallic-green sunbird of forest edges.' },
  soulap1: { common: 'White-bellied Treepie', scientific: 'Dendrocitta leucogastra', desc: 'Endemic corvid of dense evergreen forest; raucous and clever.' },
  trafly1: { common: 'Travancore Flycatcher', scientific: 'Ficedula travancoreensis', desc: 'Tiny endemic flycatcher of montane shola forests.' },
  velfly1: { common: 'Verditer Flycatcher', scientific: 'Eumyias thalassinus', desc: 'Turquoise-blue, sits conspicuously on wires and high perches.' },
  whbbab1: { common: 'White-bellied Blue Flycatcher', scientific: 'Cyornis pallipes', desc: 'Dark blue above, white below; endemic to Western Ghats.' },
  whtbul1: { common: 'White-browed Bulbul', scientific: 'Pycnonotus luteolus', desc: 'Dull olive bulbul with bold supercilium; loud cheerful song.' },
  yelbab1: { common: 'Yellow-browed Bulbul', scientific: 'Iole indica', desc: 'Bright olive-yellow; vocal in evergreen forest canopy.' },
  nocdet: { common: 'No bird detected', scientific: '', desc: 'The model did not detect a bird call with sufficient confidence.' },
}

export function getSpecies(label) {
  return SPECIES[label] ?? { common: label, scientific: '', desc: 'Western Ghats species.' }
}
