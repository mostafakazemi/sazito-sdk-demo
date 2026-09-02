import type { ComponentType } from "react";
import { MessageCircle } from "lucide-react";

import { BaleIcon } from "@/components/store/social-icons/bale-icon";
import { EitaaIcon } from "@/components/store/social-icons/eitaa-icon";
import { FacebookIcon } from "@/components/store/social-icons/facebook-icon";
import type { SocialSvgProps } from "@/components/store/social-icons/icon-props";
import { InstagramIcon } from "@/components/store/social-icons/instagram-icon";
import { RubikaIcon } from "@/components/store/social-icons/rubika-icon";
import { SoroushPlusIcon } from "@/components/store/social-icons/soroush-plus-icon";
import { TelegramIcon } from "@/components/store/social-icons/telegram-icon";
import { WhatsappIcon } from "@/components/store/social-icons/whatsapp-icon";
import { XIcon } from "@/components/store/social-icons/x-icon";
import type { StoreSocialType } from "@/lib/sazito/types";

const socialIcons: Partial<
  Record<StoreSocialType, ComponentType<SocialSvgProps>>
> = {
  bale: BaleIcon,
  eitaa: EitaaIcon,
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  rubika: RubikaIcon,
  soroush_plus: SoroushPlusIcon,
  telegram: TelegramIcon,
  whatsapp: WhatsappIcon,
  x: XIcon,
};

export function SocialIcon({ type }: { type: StoreSocialType }) {
  const Icon = socialIcons[type];

  return Icon ? (
    <Icon aria-hidden="true" className="size-4 shrink-0" />
  ) : (
    <MessageCircle aria-hidden="true" className="size-4 shrink-0" />
  );
}
