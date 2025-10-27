import type { LanguageCode } from "@/types"

type PromptCatalogue = {
  label: string
  prompts: string[]
}

export const DEFAULT_LANGUAGE: LanguageCode = "en"

export const PROMPT_LANGUAGES: Record<LanguageCode, PromptCatalogue> = {
  en: {
    label: "English",
    prompts: [
      "The quick brown fox jumps over the lazy dog.",
      "Practice makes perfect when you type every day.",
      "Speed and accuracy are both important skills.",
      "Keep your fingers on the home row keys.",
      "Programming is the art of telling another human what one wants the computer to do.",
      "Technology has revolutionized the way we communicate and work in the modern world.",
      "Every expert was once a beginner who never gave up on their dreams and goals.",
      "Learning to code opens up endless possibilities for creativity and problem solving.",
      "Artificial intelligence is transforming industries and changing how we work.",
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      "Innovation distinguishes between a leader and a follower in any field.",
      "Digital transformation is reshaping businesses and creating new opportunities.",
      "Cloud computing has made technology more accessible and affordable for everyone.",
      "Cybersecurity is crucial for protecting our digital lives and personal information.",
      "Open source software has democratized access to powerful development tools.",
      "User experience design focuses on creating intuitive and enjoyable interactions.",
      "Remote work has transformed traditional office culture and collaboration methods.",
      "Online education makes learning accessible to people regardless of their location.",
      "Sustainable technology solutions are essential for protecting our planet's future.",
      "Continuous learning keeps professionals adaptable in fast-paced industries.",
    ],
  },
  mn: {
    label: "Монгол",
    prompts: [
      "Өглөөний нар цонхоор тусахад би аяга кофе чанаж, зөөлөн хөгжим сонсон ажлынхаа төлөвлөгөөг бодож суулаа.",
      "Хүүхдүүдийн инээд гудамж дүүргэж, салхины аясаар модны навч зөөлөн намирч байв.",
      "Ээж маань амралтын өглөө бидэнд халуун будаа, шар тосоор амтат хоол хийж өгдөг заншилтай.",
      "Хотын төвөөр алхахад хүмүүсийн яриа, машины дуу чимээ холилдон их л завгүй орчин бүрддэг.",
      "Бороо шиврэхэд гэрийн дээвэр дээрх дуслын чимээ тайвшруулж, ном уншихад хамгийн тохиромжтой мөч болдог.",
      "Би ажлынхаа дараа цай ууж, ном уншин, тайван оройн цагаа өнгөрүүлэх дуртай.",
      "Манай сургуулийн багш нар сурагчдаа үргэлж урамшуулж, шинэ зүйл сурахад нь тусалдаг.",
      "Намрын сэрүүн орой хотоор алхахад агаарын үнэр, навчсын шаргал өнгө сэтгэлд дулаан мэдрэмж төрүүлдэг.",
      "Эгч маань хөгжим тоглох дуртай бөгөөд өдөр бүр шинэ ая сурч, бидэнд тоглож өгдөг.",
      "Ажил дуусах мөчид нар жаргаж, хотын гэрлүүд нэг нэгээрээ асах нь их гоё харагддаг.",
      "Өнгөрсөн зун бид гэр бүлээрээ хөдөө аялж, ногоон тал дундуур салхи сөрөн морь унаж, одтой шөнө гал тойрон сууцгааж, ээжийн хийсэн халуун цайг шимэн байгалийн үнэрийг мэдэрч байсан.",
      "Би өглөө бүр ажилдаа явахын өмнө цонхоор харж, тэнгэрийн өнгийг ажиглан тухайн өдрийн уур амьсгалыг мэдрэх дуртай.",
      "Хүүхэд насандаа өвөл бүр цасан хүн хийж, хөршийн хүүхдүүдтэй цасны тулаан хийдэг байсан минь одоо ч хамгийн дурсамжтай мөчүүдийн нэг.",
      "Сургуулийн тайзан дээр анх дуулж зогсох үед гар минь чичирч байсан ч дуугаа дуусгасны дараа сонсогчдын алга ташилт бүх айдсыг минь арилгасан.",
      "Хотын гудамжинд алхахдаа би хүмүүсийн инээмсэглэл, хүйтэн салхи, гэрлийн тусгал бүгдийг нэгэн зэрэг анзаарч, амьдралын өнгийг мэдэрдэг.",
      "Би шинэ ном худалдаж авах болгондоо түүний анхных нь үнэрийг嗅эж, эхний хуудсыг нээх тэр мэдрэмжийг хамгийн ихээр хүлээдэг.",
      "Аав маань үргэлж “Аливаа зүйлд чин сэтгэлээсээ хандвал үр дүн нь өөрөө ирдэг” гэж хэлдэг байсан нь өнөөдөр ч намайг чиглүүлдэг үг.",
      "Өвлийн орой цонхны цаана цас орж, би зузаан хөнжилдөө халуун шоколад ууж суух тэр мэдрэмжийг юутай ч зүйрлэхийн аргагүй.",
      "Оюутан байхдаа найзуудтайгаа оройн цагаар номын санд сууцгааж, ирээдүйн мөрөөдлийнхөө талаар удаан ярилцдаг байлаа.",
      "Хаврын салхи хацар илбэж, шувуудын жиргээ сэрж буй байгальд шинэ амь оруулдаг шиг надад ч урам зориг өгдөг.",
      "Хүйтэн намрын өглөөний утаатай агаарт би алхахдаа өөрийнхөө ирээдүйг бодож, өмнө туулсан алдаа, ололтоо дэнслэн, амжилт гэдэг үргэлж гадаа биш, харин дотроос ургадаг зүйл гэдгийг ухаарсан.",
      "Нэгэн орой би ажлын дараа автобусанд сууж явахдаа хүмүүсийн яриа, гэрлэн дохионы анивчлал, борооны чимээ бүгд нэгэн ая мэт зохицож, хотын амьдралын хэмнэлийг төгс илэрхийлж байгааг мэдэрсэн.",
      "Амьдралд хүн бүхэнд боломж олддог ч тэр боломжийг ашиглах эсэх нь тухайн хүний зориг, итгэл, тууштай байдлаас шалтгаалдаг гэдгийг би олон жилийн туршлагаараа ойлгосон.",
      "Хүүхэд байхдаа би байгальд хайртай хүн болно гэж мөрөөддөг байсан бөгөөд одоо тэр мөрөөдлөө бодитоор хэрэгжүүлэхийн тулд мод тарих, хог хаягдлыг ангилах зуршлыг өөртөө бий болгосон.",
      "Өнөөдөр би цонхоор гадагш харахад нарны туяа барилга дээр тусан алтлаг өнгөөр гялалзаж, холын уулс цэнхэртэн, хотын дуу чимээ бүхэлдээ нэгэн зураг шиг харагдаж байлаа.",
      "Би анх программчлал сурч эхлэхдээ маш их айдастай байсан ч өдөр бүр бага багаар суралцсаар, одоо олон хүний ажлыг хөнгөвчилдөг систем бүтээдэг болсон.",
      "Амжилт гэдэг зөвхөн бусдын нүдэнд харагдах зүйл биш, харин өөрийн зорилгодоо үнэнч байж, өчигдрөөсөө нэг алхам урагшилсан тэр мөч юм гэж би итгэдэг.",
      "Хөдөө төрж өссөн надад хотын амьдрал эхэндээ хэцүү байсан ч, би хүмүүсийн олон янз зан төлөв, соёл, хэмнэлийг ажигласнаар илүү уужим сэтгэлтэй болсон.",
      "Нэгэн бороотой орой би ганцаараа гудамжаар алхахдаа хүүхэд насны дурсамжууд, амьдралынхаа хамгийн чухал мөчүүдийг эргэн бодож, цаг хугацаа хэчнээн хурдан өнгөрдөгийг ухаарсан.",
      "Хэрвээ хүн мөрөөдлөө дагаж, тэвчээртэй байж чадвал, ямар ч бэрхшээл, ямар ч зам гүн байх нь хамаагүй — тэр хүн өөрийн хүссэн оргилд хэзээ нэгэн цагт хүрдэг гэдэгт би итгэдэг.",
    ],
  },
}

export const LANGUAGE_OPTIONS = Object.entries(PROMPT_LANGUAGES).map(([value, { label }]) => ({
  value: value as LanguageCode,
  label,
}))

export function getDefaultPrompt(language: LanguageCode = DEFAULT_LANGUAGE): string {
  const catalogue = PROMPT_LANGUAGES[language] ?? PROMPT_LANGUAGES[DEFAULT_LANGUAGE]
  return catalogue.prompts[0]
}

export function getRandomPrompt(language: LanguageCode = DEFAULT_LANGUAGE): string {
  const catalogue = PROMPT_LANGUAGES[language] ?? PROMPT_LANGUAGES[DEFAULT_LANGUAGE]
  const list = catalogue.prompts
  return list[Math.floor(Math.random() * list.length)]
}

export function getLanguageLabel(language: LanguageCode): string {
  return PROMPT_LANGUAGES[language]?.label ?? PROMPT_LANGUAGES[DEFAULT_LANGUAGE].label
}
