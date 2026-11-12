// 출생지 목록 (위도·경도는 시청 소재지 기준 대략값). 한국은 시·군 단위, 해외는 주요 도시.
export interface City {
  name: string
  country?: string
  region?: string
  lat: number
  lon: number
  /** 영어 이름(검색용) */
  en?: string
}

// "이름|지역|위도|경도|English"
const KR = `서울|서울특별시|37.57|126.98|Seoul
부산|부산광역시|35.18|129.08|Busan
인천|인천광역시|37.46|126.71|Incheon
대구|대구광역시|35.87|128.60|Daegu
대전|대전광역시|36.35|127.38|Daejeon
광주|광주광역시|35.16|126.85|Gwangju
울산|울산광역시|35.54|129.31|Ulsan
세종|세종특별자치시|36.48|127.29|Sejong
수원|경기도|37.26|127.03|Suwon
고양|경기도|37.66|126.83|Goyang
용인|경기도|37.24|127.18|Yongin
성남|경기도|37.42|127.13|Seongnam
부천|경기도|37.50|126.77|Bucheon
안산|경기도|37.32|126.83|Ansan
안양|경기도|37.39|126.95|Anyang
남양주|경기도|37.64|127.22|Namyangju
화성|경기도|37.20|126.83|Hwaseong
평택|경기도|36.99|127.11|Pyeongtaek
의정부|경기도|37.74|127.05|Uijeongbu
시흥|경기도|37.38|126.80|Siheung
파주|경기도|37.76|126.78|Paju
김포|경기도|37.62|126.72|Gimpo
광명|경기도|37.48|126.86|Gwangmyeong
이천|경기도|37.27|127.44|Icheon
군포|경기도|37.36|126.94|Gunpo
하남|경기도|37.54|127.21|Hanam
오산|경기도|37.15|127.07|Osan
양주|경기도|37.79|127.05|Yangju
구리|경기도|37.60|127.13|Guri
안성|경기도|37.01|127.28|Anseong
포천|경기도|37.89|127.20|Pocheon
의왕|경기도|37.34|126.97|Uiwang
여주|경기도|37.30|127.64|Yeoju
양평|경기도|37.49|127.49|Yangpyeong
동두천|경기도|37.90|127.06|Dongducheon
과천|경기도|37.43|126.99|Gwacheon
광주|경기도|37.43|127.26|Gwangju
연천|경기도|38.10|127.07|Yeoncheon
가평|경기도|37.83|127.51|Gapyeong
춘천|강원도|37.88|127.73|Chuncheon
원주|강원도|37.34|127.92|Wonju
강릉|강원도|37.75|128.88|Gangneung
동해|강원도|37.52|129.11|Donghae
태백|강원도|37.16|128.99|Taebaek
속초|강원도|38.21|128.59|Sokcho
삼척|강원도|37.45|129.17|Samcheok
홍천|강원도|37.69|127.89|Hongcheon
횡성|강원도|37.49|127.98|Hoengseong
영월|강원도|37.18|128.46|Yeongwol
평창|강원도|37.37|128.39|Pyeongchang
정선|강원도|37.38|128.66|Jeongseon
철원|강원도|38.15|127.31|Cheorwon
화천|강원도|38.11|127.71|Hwacheon
양구|강원도|38.11|127.99|Yanggu
인제|강원도|38.07|128.17|Inje
고성|강원도|38.38|128.47|Goseong
양양|강원도|38.08|128.62|Yangyang
청주|충청북도|36.64|127.49|Cheongju
충주|충청북도|36.99|127.93|Chungju
제천|충청북도|37.13|128.19|Jecheon
보은|충청북도|36.49|127.73|Boeun
옥천|충청북도|36.31|127.57|Okcheon
영동|충청북도|36.17|127.78|Yeongdong
진천|충청북도|36.86|127.44|Jincheon
괴산|충청북도|36.82|127.79|Goesan
음성|충청북도|36.94|127.69|Eumseong
단양|충청북도|36.98|128.37|Danyang
증평|충청북도|36.79|127.58|Jeungpyeong
천안|충청남도|36.82|127.15|Cheonan
공주|충청남도|36.45|127.12|Gongju
보령|충청남도|36.33|126.61|Boryeong
아산|충청남도|36.79|127.00|Asan
서산|충청남도|36.78|126.45|Seosan
논산|충청남도|36.19|127.10|Nonsan
계룡|충청남도|36.27|127.25|Gyeryong
당진|충청남도|36.89|126.65|Dangjin
금산|충청남도|36.11|127.49|Geumsan
부여|충청남도|36.28|126.91|Buyeo
서천|충청남도|36.08|126.69|Seocheon
청양|충청남도|36.46|126.80|Cheongyang
홍성|충청남도|36.60|126.66|Hongseong
예산|충청남도|36.68|126.85|Yesan
태안|충청남도|36.75|126.30|Taean
전주|전라북도|35.82|127.15|Jeonju
군산|전라북도|35.97|126.74|Gunsan
익산|전라북도|35.95|126.96|Iksan
정읍|전라북도|35.57|126.86|Jeongeup
남원|전라북도|35.42|127.39|Namwon
김제|전라북도|35.80|126.88|Gimje
완주|전라북도|35.90|127.16|Wanju
진안|전라북도|35.79|127.42|Jinan
무주|전라북도|36.01|127.66|Muju
장수|전라북도|35.65|127.52|Jangsu
임실|전라북도|35.62|127.29|Imsil
순창|전라북도|35.37|127.14|Sunchang
고창|전라북도|35.44|126.70|Gochang
부안|전라북도|35.73|126.73|Buan
목포|전라남도|34.81|126.39|Mokpo
여수|전라남도|34.76|127.66|Yeosu
순천|전라남도|34.95|127.49|Suncheon
나주|전라남도|35.02|126.71|Naju
광양|전라남도|34.94|127.70|Gwangyang
담양|전라남도|35.32|126.99|Damyang
곡성|전라남도|35.28|127.29|Gokseong
구례|전라남도|35.20|127.46|Gurye
고흥|전라남도|34.61|127.28|Goheung
보성|전라남도|34.77|127.08|Boseong
화순|전라남도|35.06|126.99|Hwasun
장흥|전라남도|34.68|126.91|Jangheung
강진|전라남도|34.64|126.77|Gangjin
해남|전라남도|34.57|126.60|Haenam
영암|전라남도|34.80|126.70|Yeongam
무안|전라남도|34.99|126.48|Muan
함평|전라남도|35.07|126.52|Hampyeong
영광|전라남도|35.28|126.51|Yeonggwang
장성|전라남도|35.30|126.78|Jangseong
완도|전라남도|34.31|126.75|Wando
진도|전라남도|34.49|126.26|Jindo
신안|전라남도|34.83|126.11|Sinan
포항|경상북도|36.02|129.34|Pohang
경주|경상북도|35.86|129.22|Gyeongju
김천|경상북도|36.14|128.11|Gimcheon
안동|경상북도|36.57|128.73|Andong
구미|경상북도|36.12|128.34|Gumi
영주|경상북도|36.81|128.62|Yeongju
영천|경상북도|35.97|128.94|Yeongcheon
상주|경상북도|36.41|128.16|Sangju
문경|경상북도|36.59|128.20|Mungyeong
경산|경상북도|35.83|128.74|Gyeongsan
의성|경상북도|36.35|128.70|Uiseong
청송|경상북도|36.44|129.06|Cheongsong
영양|경상북도|36.67|129.11|Yeongyang
영덕|경상북도|36.42|129.37|Yeongdeok
청도|경상북도|35.65|128.74|Cheongdo
고령|경상북도|35.73|128.26|Goryeong
성주|경상북도|35.92|128.28|Seongju
칠곡|경상북도|35.99|128.40|Chilgok
예천|경상북도|36.66|128.45|Yecheon
봉화|경상북도|36.89|128.73|Bonghwa
울진|경상북도|36.99|129.40|Uljin
울릉|경상북도|37.48|130.91|Ulleung
창원|경상남도|35.23|128.68|Changwon
진주|경상남도|35.18|128.11|Jinju
통영|경상남도|34.85|128.43|Tongyeong
사천|경상남도|35.00|128.06|Sacheon
김해|경상남도|35.23|128.88|Gimhae
밀양|경상남도|35.50|128.75|Miryang
거제|경상남도|34.88|128.62|Geoje
양산|경상남도|35.34|129.04|Yangsan
의령|경상남도|35.32|128.26|Uiryeong
함안|경상남도|35.27|128.41|Haman
창녕|경상남도|35.54|128.49|Changnyeong
고성|경상남도|34.97|128.32|Goseong
남해|경상남도|34.84|127.89|Namhae
하동|경상남도|35.07|127.75|Hadong
산청|경상남도|35.42|127.87|Sancheong
함양|경상남도|35.52|127.73|Hamyang
거창|경상남도|35.69|127.91|Geochang
합천|경상남도|35.57|128.17|Hapcheon
제주|제주특별자치도|33.50|126.53|Jeju
서귀포|제주특별자치도|33.25|126.56|Seogwipo`

const WD = `도쿄|일본|35.68|139.65|Tokyo
오사카|일본|34.69|135.50|Osaka
교토|일본|35.01|135.77|Kyoto
요코하마|일본|35.44|139.64|Yokohama
나고야|일본|35.18|136.91|Nagoya
삿포로|일본|43.06|141.35|Sapporo
후쿠오카|일본|33.59|130.40|Fukuoka
고베|일본|34.69|135.20|Kobe
센다이|일본|38.27|140.87|Sendai
히로시마|일본|34.39|132.46|Hiroshima
나가사키|일본|32.75|129.88|Nagasaki
오키나와|일본|26.21|127.68|Okinawa
베이징|중국|39.90|116.41|Beijing
상하이|중국|31.23|121.47|Shanghai
광저우|중국|23.13|113.26|Guangzhou
선전|중국|22.54|114.06|Shenzhen
청두|중국|30.57|104.07|Chengdu
충칭|중국|29.56|106.55|Chongqing
시안|중국|34.34|108.94|Xian
톈진|중국|39.34|117.36|Tianjin
난징|중국|32.06|118.80|Nanjing
항저우|중국|30.27|120.15|Hangzhou
우한|중국|30.59|114.31|Wuhan
칭다오|중국|36.07|120.38|Qingdao
다롄|중국|38.91|121.61|Dalian
선양|중국|41.80|123.43|Shenyang
하얼빈|중국|45.80|126.53|Harbin
옌지|중국|42.89|129.51|Yanji
홍콩|중국|22.32|114.17|Hong Kong
마카오|중국|22.20|113.55|Macau
타이베이|대만|25.03|121.57|Taipei
가오슝|대만|22.63|120.30|Kaohsiung
울란바토르|몽골|47.89|106.91|Ulaanbaatar
평양|북한|39.04|125.76|Pyongyang
방콕|태국|13.76|100.50|Bangkok
치앙마이|태국|18.79|98.99|Chiang Mai
푸껫|태국|7.88|98.39|Phuket
하노이|베트남|21.03|105.85|Hanoi
호치민|베트남|10.82|106.63|Ho Chi Minh City
다낭|베트남|16.05|108.20|Da Nang
자카르타|인도네시아|-6.21|106.85|Jakarta
발리|인도네시아|-8.65|115.22|Bali
싱가포르|싱가포르|1.35|103.82|Singapore
쿠알라룸푸르|말레이시아|3.14|101.69|Kuala Lumpur
마닐라|필리핀|14.60|120.98|Manila
세부|필리핀|10.32|123.89|Cebu
양곤|미얀마|16.87|96.20|Yangon
프놈펜|캄보디아|11.56|104.93|Phnom Penh
비엔티안|라오스|17.97|102.60|Vientiane
뉴델리|인도|28.61|77.21|New Delhi
뭄바이|인도|19.08|72.88|Mumbai
벵갈루루|인도|12.97|77.59|Bengaluru
콜카타|인도|22.57|88.36|Kolkata
첸나이|인도|13.08|80.27|Chennai
다카|방글라데시|23.81|90.41|Dhaka
이슬라마바드|파키스탄|33.68|73.05|Islamabad
카라치|파키스탄|24.86|67.01|Karachi
카트만두|네팔|27.72|85.32|Kathmandu
콜롬보|스리랑카|6.93|79.86|Colombo
아스타나|카자흐스탄|51.17|71.43|Astana
알마티|카자흐스탄|43.24|76.89|Almaty
타슈켄트|우즈베키스탄|41.30|69.24|Tashkent
테헤란|이란|35.69|51.39|Tehran
바그다드|이라크|33.31|44.37|Baghdad
리야드|사우디아라비아|24.71|46.68|Riyadh
두바이|아랍에미리트|25.20|55.27|Dubai
아부다비|아랍에미리트|24.45|54.38|Abu Dhabi
도하|카타르|25.29|51.53|Doha
앙카라|튀르키예|39.93|32.86|Ankara
이스탄불|튀르키예|41.01|28.98|Istanbul
텔아비브|이스라엘|32.09|34.78|Tel Aviv
예루살렘|이스라엘|31.77|35.21|Jerusalem
베이루트|레바논|33.89|35.50|Beirut
암만|요르단|31.95|35.93|Amman
런던|영국|51.51|-0.13|London
에든버러|영국|55.95|-3.19|Edinburgh
맨체스터|영국|53.48|-2.24|Manchester
버밍엄|영국|52.49|-1.89|Birmingham
파리|프랑스|48.86|2.35|Paris
마르세유|프랑스|43.30|5.37|Marseille
리옹|프랑스|45.76|4.84|Lyon
니스|프랑스|43.70|7.27|Nice
베를린|독일|52.52|13.40|Berlin
뮌헨|독일|48.14|11.58|Munich
함부르크|독일|53.55|9.99|Hamburg
프랑크푸르트|독일|50.11|8.68|Frankfurt
쾰른|독일|50.94|6.96|Cologne
암스테르담|네덜란드|52.37|4.90|Amsterdam
브뤼셀|벨기에|50.85|4.35|Brussels
마드리드|스페인|40.42|-3.70|Madrid
바르셀로나|스페인|41.39|2.17|Barcelona
로마|이탈리아|41.90|12.50|Rome
밀라노|이탈리아|45.46|9.19|Milan
나폴리|이탈리아|40.85|14.27|Naples
베네치아|이탈리아|45.44|12.32|Venice
피렌체|이탈리아|43.77|11.26|Florence
리스본|포르투갈|38.72|-9.14|Lisbon
아테네|그리스|37.98|23.73|Athens
빈|오스트리아|48.21|16.37|Vienna
베른|스위스|46.95|7.45|Bern
취리히|스위스|47.38|8.54|Zurich
제네바|스위스|46.20|6.14|Geneva
프라하|체코|50.08|14.44|Prague
바르샤바|폴란드|52.23|21.01|Warsaw
부다페스트|헝가리|47.50|19.04|Budapest
부쿠레슈티|루마니아|44.43|26.10|Bucharest
소피아|불가리아|42.70|23.32|Sofia
베오그라드|세르비아|44.79|20.45|Belgrade
헬싱키|핀란드|60.17|24.94|Helsinki
스톡홀름|스웨덴|59.33|18.07|Stockholm
오슬로|노르웨이|59.91|10.75|Oslo
코펜하겐|덴마크|55.68|12.57|Copenhagen
레이캬비크|아이슬란드|64.15|-21.94|Reykjavik
더블린|아일랜드|53.35|-6.26|Dublin
모스크바|러시아|55.76|37.62|Moscow
상트페테르부르크|러시아|59.93|30.34|Saint Petersburg
블라디보스토크|러시아|43.12|131.89|Vladivostok
키이우|우크라이나|50.45|30.52|Kyiv
워싱턴 D.C.|미국|38.91|-77.04|Washington
뉴욕|미국|40.71|-74.01|New York
로스앤젤레스|미국|34.05|-118.24|Los Angeles
시카고|미국|41.88|-87.63|Chicago
샌프란시스코|미국|37.77|-122.42|San Francisco
시애틀|미국|47.61|-122.33|Seattle
보스턴|미국|42.36|-71.06|Boston
호놀룰루|미국|21.31|-157.86|Honolulu
라스베이거스|미국|36.17|-115.14|Las Vegas
마이애미|미국|25.76|-80.19|Miami
휴스턴|미국|29.76|-95.37|Houston
댈러스|미국|32.78|-96.80|Dallas
애틀랜타|미국|33.75|-84.39|Atlanta
덴버|미국|39.74|-104.99|Denver
샌디에이고|미국|32.72|-117.16|San Diego
피닉스|미국|33.45|-112.07|Phoenix
필라델피아|미국|39.95|-75.17|Philadelphia
디트로이트|미국|42.33|-83.05|Detroit
앵커리지|미국|61.22|-149.90|Anchorage
오타와|캐나다|45.42|-75.70|Ottawa
토론토|캐나다|43.65|-79.38|Toronto
밴쿠버|캐나다|49.28|-123.12|Vancouver
몬트리올|캐나다|45.50|-73.57|Montreal
캘거리|캐나다|51.05|-114.07|Calgary
멕시코시티|멕시코|19.43|-99.13|Mexico City
칸쿤|멕시코|21.16|-86.85|Cancun
아바나|쿠바|23.11|-82.37|Havana
보고타|콜롬비아|4.71|-74.07|Bogota
리마|페루|-12.05|-77.04|Lima
산티아고|칠레|-33.45|-70.67|Santiago
부에노스아이레스|아르헨티나|-34.60|-58.38|Buenos Aires
브라질리아|브라질|-15.79|-47.88|Brasilia
상파울루|브라질|-23.55|-46.63|Sao Paulo
리우데자네이루|브라질|-22.91|-43.17|Rio de Janeiro
카라카스|베네수엘라|10.48|-66.90|Caracas
카이로|이집트|30.04|31.24|Cairo
나이로비|케냐|-1.29|36.82|Nairobi
아디스아바바|에티오피아|9.03|38.74|Addis Ababa
라고스|나이지리아|6.52|3.38|Lagos
아크라|가나|5.60|-0.19|Accra
케이프타운|남아프리카공화국|-33.92|18.42|Cape Town
요하네스버그|남아프리카공화국|-26.20|28.05|Johannesburg
카사블랑카|모로코|33.57|-7.59|Casablanca
캔버라|호주|-35.28|149.13|Canberra
시드니|호주|-33.87|151.21|Sydney
멜버른|호주|-37.81|144.96|Melbourne
브리즈번|호주|-27.47|153.03|Brisbane
퍼스|호주|-31.95|115.86|Perth
웰링턴|뉴질랜드|-41.29|174.78|Wellington
오클랜드|뉴질랜드|-36.85|174.76|Auckland`

const parse = (src: string, world: boolean): City[] =>
  src.split('\n').map((l) => {
    const [name, where, lat, lon, en] = l.split('|')
    return world ? { name, country: where, lat: +lat, lon: +lon, en } : { name, region: where, lat: +lat, lon: +lon, en }
  })

export const KOREAN_CITIES: readonly City[] = parse(KR, false)
export const WORLD_CITIES: readonly City[] = parse(WD, true)
export const SEOUL: City = KOREAN_CITIES[0]

/** 같은 이름이 둘 이상이면 지역을 붙여서 구별한다 */
const DUP = new Set(KOREAN_CITIES.filter((c, i, a) => a.findIndex((x) => x.name === c.name) !== i).map((c) => c.name))
export function formatCityName(city: City): string {
  if (city.country) return `${city.name}, ${city.country}`
  if (city.region && DUP.has(city.name)) return `${city.name} (${city.region})`
  return city.name
}

/** 검색: 한글 이름·지역·나라, 영어 이름. 한국 도시를 먼저, 최대 20개 */
export function filterCities(query: string): City[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const hit = (c: City) => c.name.toLowerCase().includes(q) || (c.region ?? '').includes(q) || (c.country ?? '').includes(q) || (c.en ?? '').toLowerCase().includes(q)
  const starts = (c: City) => (c.name.toLowerCase().startsWith(q) || (c.en ?? '').toLowerCase().startsWith(q) ? 0 : 1)
  const all = [...KOREAN_CITIES, ...WORLD_CITIES].filter(hit)
  return all.sort((a, b) => starts(a) - starts(b)).slice(0, 20)
}
