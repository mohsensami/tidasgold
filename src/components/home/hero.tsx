import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { toToman } from '@/lib/utils';

export function Hero({ pricePerGram }: { pricePerGram: number }) {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-navy-900 via-navy-800 to-background">
            <div className="container grid gap-8 py-14 md:grid-cols-2 md:py-24 items-center">
                <div className="relative z-10 text-center md:text-right">
                    <span className="inline-block rounded-full border border-gold-300/40 bg-gold-50/10 px-4 py-1 text-xs font-medium text-gold-100">
                        گارانتی اصالت روی تمام محصولات
                    </span>
                    <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight text-gold-50 md:text-5xl">
                        درخشش طلای خالص،
                        <br />
                        <span className="gold-shimmer">به سبک شما</span>
                    </h1>
                    <p className="mt-4 max-w-md mx-auto md:mx-0 text-gold-100/80 leading-relaxed">
                        خرید آنلاین انگشتر، گردنبند، دستبند و گوشواره طلای ۱۸ عیار با قیمت شفاف و لحظه‌ای، ارسال
                        بیمه‌شده به سراسر ایران.
                    </p>
                    <div className="mt-7 flex flex-wrap justify-center md:justify-start gap-3">
                        <Button variant="gold" size="lg" asChild>
                            <Link href="/products">مشاهده محصولات</Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="border-gold-200/40 text-gold-50 hover:bg-gold-50/10 hover:text-gold-50"
                            asChild
                        >
                            <Link href="/products?category=sets">سرویس‌های عروس</Link>
                        </Button>
                    </div>
                    <p className="mt-6 text-sm text-gold-100/70">
                        قیمت لحظه‌ای هر گرم طلای ۱۸ عیار:{' '}
                        <span className="font-bold text-gold-100">{toToman(pricePerGram)}</span>
                    </p>
                </div>

                <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-2xl shadow-2xl">
                    <Image
                        src="https://17uvs34xac.ufs.sh/f/DgtN6EtPicwJoeJm0cB3IP5HNs8Kk9JlVFjUD3TbStn26Zmw"
                        alt="نمونه جواهرات طلا"
                        fill
                        priority
                        className="object-cover"
                    />
                </div>
            </div>
        </section>
    );
}
