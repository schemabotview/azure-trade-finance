import type { Section } from '../types'

export const decimal: Section = {
  id: 'decimal',
  title: 'Decimal money: the cent a float loses',
  scene: 'gold-decimal',
  narration:
    "Every amount in this pipeline has been decimal eighteen two since Silver, and the new file, money dot p y, shows why, in Spark's own arithmetic. It asks Spark S Q L for one sum, twice: zero point one plus zero point two, first as doubles, the ordinary floating point numbers, then as decimals with two places. The terminal shows the answer, and the side pane draws it. As a double, the sum is zero point three, followed by fifteen zeros and a four. Neither zero point one nor zero point two can be written exactly in binary, so each is stored as the nearest value it can hold, and the small errors add up. As a decimal, the answer is zero point three zero, exactly, every time, because a decimal counts whole cents. One sum is off by a tiny amount. Summed over hundreds of letters of credit, those amounts drift by cents, and a total that should equal a limit can land a cent either side of it: two runs could disagree about a breach. So the side pane follows the type from end to end. TradeBook stores numeric eighteen two. Bronze keeps the amount as the string it arrived as, so nothing is converted on the way in. Silver casts it to decimal eighteen two, and the last line of the terminal reads the type straight from the fact table's schema: decimal eighteen two. Next, the numbers the desk actually reads: each group against its limit.",
}
