import { useOrganizations, useWarehouses, usePayboxes, usePriceTypes } from '@/api/refs'
import RefSelect from '@/components/RefSelect'
import PhoneSearch from '@/components/PhoneSearch'
import NomenclaturePicker from '@/components/NomenclaturePicker'
import Cart from '@/components/Cart'
import { zodResolver } from '@hookform/resolvers/zod'
import { saleSchema, type SaleFormState } from '@/utils/schema'
import { isAxiosError } from 'axios'
import { useForm, type SubmitErrorHandler, type SubmitHandler } from 'react-hook-form'
import { createSale, extractDocLabel } from '@/api/sales'
import { buildPayload } from '@/utils/payload'
import { useState } from 'react'
import NomenclatureQuickSearch from '@/components/NomenclatureQuickSearch'
import type { NomenclatureItem } from '@/api/products'
import { message } from 'antd'
import { Typography, Button } from 'antd'
const { Title } = Typography


export default function SaleScreen() {
    const { data: orgs = [], isLoading: isOrgLoading } = useOrganizations()
    const { data: whs = [], isLoading: isWhLoading } = useWarehouses()
    const { data: payboxes = [], isLoading: isPayboxLoading } = usePayboxes()
    const { data: priceTypes = [], isLoading: isPriceLoading } = usePriceTypes()
    const [messageApi, contextHolder] = message.useMessage()

    const {
        handleSubmit,
        setValue,
        setError,
        trigger,
        watch,
        formState: { isSubmitting, errors },
    } = useForm<SaleFormState>({
        resolver: zodResolver(saleSchema),
        defaultValues: { goods: [], conduct: false },
        mode: 'onChange',
    })

    type LineErr = { price?: string; quantity?: string; discount?: string; sum_discounted?: string }
    const cartErrors: LineErr[] =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (Array.isArray(errors.goods) ? errors.goods : [])?.map((e: any) => ({
            price: e?.price?.message,
            quantity: e?.quantity?.message,
            discount: e?.discount?.message,
            sum_discounted: e?.sum_discounted?.message,
        })) ?? []

    const [pickerOpen, setPickerOpen] = useState(false)

    const organization = watch('organization')
    const warehouse = watch('warehouse')
    const priceType = watch('price_type')
    const goods = watch('goods') ?? []
    const formValues = watch()

    const loading = isOrgLoading || isWhLoading || isPayboxLoading || isPriceLoading
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-bounce w-14 h-14 bg-amber-500 rounded-full" />
            </div>
        )
    }

    const onPickNomenclature = (p: NomenclatureItem) => {
        setValue('goods', [
            ...goods,
            { name: p.name, nomenclature: p.id, unit: p.unit, price: 0, discount: 0, sum_discounted: 0, quantity: 1 },
        ], { shouldValidate: true })
        setPickerOpen(false)
    }

    const normalizeErr = (e: unknown) => {
        if (isAxiosError<{ detail?: string }>(e)) return e.response?.data?.detail ?? e.message
        if (e instanceof Error) return e.message
        try { return JSON.stringify(e) } catch { return 'Неизвестная ошибка' }
    }

    const validateAllRequired = async (): Promise<boolean> => {
        const missing: Array<{ path: Parameters<typeof setError>[0]; label: string }> = []

        if (!formValues.organization) missing.push({ path: 'organization', label: 'Организация' })
        if (!formValues.warehouse) missing.push({ path: 'warehouse', label: 'Склад' })
        if (!formValues.paybox) missing.push({ path: 'paybox', label: 'Счёт/касса' })
        if (!formValues.contragent) missing.push({ path: 'contragent', label: 'Контрагент' })
        if (!formValues.price_type) missing.push({ path: 'price_type', label: 'Тип цен' })
        if (!formValues.goods?.length) missing.push({ path: 'goods', label: 'Корзина (добавьте товар)' })

        await trigger('goods');
        console.log('formValues', formValues);

        (formValues.goods || []).forEach((g, i) => {
            if ((g.quantity ?? 0) <= 0) {
                setError(`goods.${i}.quantity` as Parameters<typeof setError>[0], { type: 'manual', message: 'Количество должно быть > 0' });
            }
            if ((g.price ?? 0) <= 0) {
                console.log(g.price, "g.price")
                setError(`goods.${i}.price` as Parameters<typeof setError>[0], { type: 'manual', message: 'Цена не может быть отрицательной' });
            }
        })

        if (missing.length) {
            missing.forEach(m => setError(m.path, { type: 'manual', message: 'Обязательное поле' }))
            messageApi.error({
                content: (
                    <div>
                        <div>Заполните/исправьте поля:</div>
                        <ul style={{ margin: '6px 0 0 18px' }}>
                            {missing.map(m => <li key={String(m.path)}>{m.label}</li>)}
                        </ul>
                    </div>
                ),
            })
            return false;
        }
        return true;
    }

    const onInvalidSubmit: SubmitErrorHandler<SaleFormState> = async () => {
        await trigger('goods');

        if (!formValues.price_type) {
            setError('price_type', { type: 'manual', message: 'Обязательное поле' })
        }
        if (!formValues.contragent) {
            setError('contragent', { type: 'manual', message: 'Обязательное поле' })
        }
        if (!formValues.goods?.length) {
            setError('goods', { type: 'manual', message: 'Добавьте хотя бы один товар' });
        }

        const missing: string[] = [];
        if (!formValues.organization) missing.push('Организация');
        if (!formValues.warehouse) missing.push('Склад');
        if (!formValues.paybox) missing.push('Счёт/касса');
        if (!formValues.price_type) missing.push('Тип цен');
        if (!formValues.contragent) missing.push('Контрагент');
        if (!formValues.goods?.length) missing.push('Корзина (добавьте товар)');

        (formValues.goods || []).forEach((g, i) => {
            console.log('goods', g)
            if ((g.quantity ?? 0) <= 0) {
                setError(`goods.${i}.quantity` as Parameters<typeof setError>[0], { type: 'manual', message: 'Количество должно быть > 0' })
            }
            if ((g.price ?? 0) <= 0) {
                setError(`goods.${i}.price` as Parameters<typeof setError>[0], { type: 'manual', message: 'Цена не может быть отрицательной' })
            }
        })
        messageApi.error({
            content: (
                <div>
                    <div>Заполните/исправьте поля:</div>
                    <ul style={{ margin: '6px 0 0 18px' }}>
                        {missing.length
                            ? missing.map((m) => <li key={m}>{m}</li>)
                            : <li>Проверьте значения в корзине</li>}
                    </ul>
                </div>
            ),
        })
    }

    const onSubmitFactory = (conduct: boolean): SubmitHandler<SaleFormState> =>
        async (data) => {
            const ok = await validateAllRequired()
            if (!ok) return
            try {
                const payload = buildPayload({ ...data, conduct })
                console.log('payload', payload)
                const resp = await createSale(payload)
                const label = extractDocLabel(resp)
                message.success(
                    label
                        ? `Документ ${conduct ? 'проведён' : 'создан (черновик)'} № ${label}`
                        : `Документ ${conduct ? 'проведён' : 'создан (черновик)'}`
                )
                setValue('goods', [])
            } catch (e: unknown) {
                message.error(normalizeErr(e) || (conduct ? 'Ошибка при проведении' : 'Ошибка при создании'))
            }
        }

    const submitDraft = handleSubmit(onSubmitFactory(false), onInvalidSubmit)
    const submitConduct = handleSubmit(onSubmitFactory(true), onInvalidSubmit)

    return (
        <div className="app-container min-h-screen h-full flex flex-col">
            {contextHolder}

            <div className="app-container w-full">
                <div className="section-card w-full">
                    <Title level={4} style={{ marginTop: 0, marginBottom: 12 }}>Параметры документа</Title>

                    <RefSelect label="Организация" items={orgs} value={organization}
                        loading={isOrgLoading}
                        onChange={(v) => setValue('organization', v, { shouldValidate: true })}
                        error={errors.organization?.message}
                    />
                    <RefSelect label="Склад" items={whs} value={warehouse}
                        loading={isWhLoading}
                        onChange={(v) => setValue('warehouse', v, { shouldValidate: true })}
                        error={errors.warehouse?.message}
                    />
                    <RefSelect label="Счёт/касса" items={payboxes} value={watch('paybox')}
                        loading={isPayboxLoading}
                        onChange={(v) => setValue('paybox', v, { shouldValidate: true })}
                        error={errors.paybox?.message}
                    />
                    <RefSelect label="Тип цен" items={priceTypes} value={priceType}
                        loading={isPriceLoading}
                        onChange={(v) => setValue('price_type', v, { shouldValidate: true })}
                        error={errors.price_type?.message}
                    />
                    <PhoneSearch
                        value={watch('contragent')}
                        onChange={(id) => setValue('contragent', id, { shouldValidate: true })}
                        error={errors.contragent?.message}
                    />
                </div>

                <div className="section-card">
                    <Title level={4} style={{ marginTop: 0, marginBottom: 12 }}>Номенклатура</Title>
                    <NomenclatureQuickSearch
                        warehouseId={warehouse}
                        onPick={(p) => {
                            setValue('goods', [
                                ...goods,
                                { name: p.name, nomenclature: p.id, unit: p.unit, price: 0, discount: 0, sum_discounted: 0, quantity: 1 },
                            ], { shouldValidate: true })
                            trigger('goods')
                        }}
                        onOpenPicker={() => setPickerOpen(true)}
                        error={!!errors.goods?.message}
                    />
                    <Cart
                        rows={goods}
                        onChange={(rows) => { setValue('goods', rows, { shouldValidate: true }); trigger('goods') }}
                        errors={cartErrors}
                    />
                    <NomenclaturePicker
                        open={pickerOpen}
                        onClose={() => setPickerOpen(false)}
                        onPick={onPickNomenclature}
                        warehouseId={warehouse}
                    />
                </div>
            </div>

            <div className="action-bar">
                <div className="action-bar__inner">
                    <Button type="primary" size="large" disabled={isSubmitting} onClick={submitDraft}>
                        Создать
                    </Button>
                    <Button size="large" disabled={isSubmitting} onClick={submitConduct}>
                        Создать и провести
                    </Button>
                </div>
            </div>
        </div>
    )
}