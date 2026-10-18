import {
  Home, HeartHandshake, Users, Building2, KeyRound, Heart, Truck, School, ArrowLeftRight, Ban, FileText,
  CalendarX, GraduationCap, Stethoscope, BedDouble, Brain, Pill, AlertTriangle, Baby, Split, Flower2,
  Phone, HeartPulse, HeartCrack, ClipboardList, LifeBuoy, ShieldAlert, Landmark, Scale, FolderCheck,
  Siren, Search, Trophy, Star, Pause, BookOpenCheck, Presentation, type LucideIcon,
} from "lucide-react";

const BY_TYPE: Record<string, LucideIcon> = {
  "lived with birth family": Home, "foster placement": HeartHandshake, "kinship care": Users,
  "residential care": Building2, "supported accommodation": KeyRound, adoption: Heart, "moved home": Truck,
  "started school": School, "changed school": ArrowLeftRight, suspension: Pause, exclusion: Ban, "ehcp issued": FileText,
  "attendance concern": CalendarX, "left education": GraduationCap,
  diagnosis: Stethoscope, "hospital admission": BedDouble, "camhs involvement": Brain, "medication started": Pill,
  "self-harm incident": AlertTriangle,
  "birth of sibling": Baby, "parental separation": Split, bereavement: Flower2, "contact arrangement": Phone,
  "relationship began": HeartPulse, "relationship ended": HeartCrack,
  referral: ClipboardList, "child in need plan": LifeBuoy, "child protection plan": ShieldAlert,
  "looked after": Landmark, "youth justice involvement": Scale, "case closed": FolderCheck,
  "educational psychology": BookOpenCheck, "specialist teacher": Presentation,
  "police involvement": Siren, "missing episode": Search, achievement: Trophy, other: Star,
};

const BY_CAT: Record<string, LucideIcon> = {
  living: Home, education: School, health: Stethoscope, family: Users, services: ClipboardList, significant: Star,
};

export const iconFor = (category: string, type: string): LucideIcon =>
  BY_TYPE[type.toLowerCase()] ?? BY_CAT[category] ?? Star;
export const categoryIcon = (category: string): LucideIcon => BY_CAT[category] ?? Star;
