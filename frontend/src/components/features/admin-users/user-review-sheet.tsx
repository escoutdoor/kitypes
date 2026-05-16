"use client"

import Link from "next/link"
import { Ban, CheckCircle2, Loader2, Calendar, Flag, PawPrint, Phone, Mail, Save, AlertTriangle, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { useUpdateUserRole, useBanAdminUser, useUnbanAdminUser } from "@/hook/useAdminUserMutations"
import { User, UserRole } from "@/service/user/user.interface"
import { cn } from "@/lib/utils"

type Props = {
    user: User | null
    isOpen: boolean
    onOpenChangeAction: (open: boolean) => void
}

const ROLE_LABELS: Record<string, string> = {
    user: "Користувач",
    volunteer: "Волонтер",
    shelter: "Притулок",
    admin: "Адміністратор",
}

export function UserReviewSheet({ user, isOpen, onOpenChangeAction }: Props) {
    const { mutateAsync: updateRole, isPending: isUpdatingRole } = useUpdateUserRole()
    const { mutateAsync: banUser, isPending: isBanning } = useBanAdminUser()
    const { mutateAsync: unbanUser, isPending: isUnbanning } = useUnbanAdminUser()

    const isPending = isUpdatingRole || isBanning || isUnbanning

    const [chosenRole, setChosenRole] = useState<UserRole>("user")

    useEffect(() => {
        if (user) {
            setChosenRole(user.role)
        }
    }, [user?.id, user?.role, isOpen])

    if (!user) return null

    const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()

    const handleSaveRole = async () => {
        if (chosenRole === user.role) return

        try {
            await updateRole({ id: user.id, data: { role: chosenRole } })
            toast.success(`Роль користувача успішно змінено на "${ROLE_LABELS[chosenRole]}"`)
        } catch {
            toast.error("Не вдалося оновити роль користувача")
        }
    }

    const handleBanToggle = async () => {
        try {
            if (user.isBanned) {
                await unbanUser(user.id)
                toast.success("Користувача успішно розблоковано")
            } else {
                await banUser(user.id)
                toast.success("Користувача заблоковано")
            }
        } catch {
            toast.error("Не вдалося оновити статус блокування")
        }
    }

    const hasRoleChanged = chosenRole !== user.role

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChangeAction}>
            <SheetContent side="right" className="w-full sm:max-w-md md:max-w-xl p-0 bg-gray-50 flex flex-col sm:max-w-none">
                <SheetTitle className="sr-only">Профіль користувача</SheetTitle>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="bg-white p-6 sm:p-8 border-b border-gray-100">
                        <SheetHeader className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                    !user.isBanned ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                )}>
                                    {!user.isBanned ? "Активний" : "Заблокований"}
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 border-2 border-gray-100 shadow-sm shrink-0">
                                    <AvatarImage src={user.avatarUrl || ""} className="object-cover" />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">{initials}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <SheetTitle className="text-2xl font-bold text-gray-900 leading-tight">
                                        {user.firstName} {user.lastName}
                                    </SheetTitle>
                                    <div className="text-sm text-gray-500 font-mono mt-1 select-all">
                                        ID: {user.id}
                                    </div>
                                </div>
                                <Button asChild variant="outline" size="sm" className="shrink-0 cursor-pointer">
                                    <Link href={`/users/${user.id}`} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-4 h-4 mr-1.5" /> Профіль
                                    </Link>
                                </Button>
                            </div>

                            <SheetDescription className="flex items-center gap-2 mt-4">
                                <Calendar className="w-4 h-4" />
                                На платформі з {new Intl.DateTimeFormat("uk-UA", {
                                    day: "numeric", month: "long", year: "numeric"
                                }).format(new Date(user.createdAt))}
                            </SheetDescription>
                        </SheetHeader>
                    </div>

                    <div className="p-6 sm:p-8 space-y-8">
                        <section className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Активність</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <Button asChild variant="outline" className="justify-start cursor-pointer w-full text-gray-700 h-12 shadow-sm border-gray-200 hover:bg-gray-50">
                                    <Link href={`/admin/ads?authorId=${user.id}`}>
                                        <PawPrint className="w-4 h-4 mr-3 text-primary" />
                                        Переглянути всі оголошення користувача
                                    </Link>
                                </Button>

                                <Button asChild variant="outline" className="justify-start cursor-pointer w-full text-gray-700 h-12 shadow-sm border-gray-200 hover:bg-gray-50">
                                    <Link href={`/admin/reports?targetType=user&targetId=${user.id}`}>
                                        <Flag className="w-4 h-4 mr-3 text-red-500" />
                                        Скарги НА цього користувача
                                    </Link>
                                </Button>

                                <Button asChild variant="outline" className="justify-start cursor-pointer w-full text-gray-700 h-12 shadow-sm border-gray-200 hover:bg-gray-50">
                                    <Link href={`/admin/reports?reporterId=${user.id}`}>
                                        <AlertTriangle className="w-4 h-4 mr-3 text-purple-500" />
                                        Скарги ВІД цього користувача
                                    </Link>
                                </Button>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Контактні дані</h3>
                            <Card className="border-none shadow-sm">
                                <CardContent className="p-5 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                            <Mail className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm text-gray-500 font-medium mb-0.5">Email</p>
                                            <a href={`mailto:${user.email}`} className="font-bold text-gray-900 hover:text-primary transition-colors truncate block">
                                                {user.email}
                                            </a>
                                        </div>
                                    </div>
                                    {user.phoneNumber && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                                <Phone className="w-5 h-5 text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 font-medium mb-0.5">Телефон</p>
                                                <a href={`tel:${user.phoneNumber}`} className="font-bold text-gray-900 hover:text-primary transition-colors">
                                                    {user.phoneNumber}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Управління роллю</h3>
                            <Card className="border-none shadow-sm overflow-visible">
                                <CardContent className="p-5 space-y-4">
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        Виберіть нову роль зі списку та натисніть кнопку підтвердження для збереження змін.
                                    </p>
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                        <Select
                                            value={chosenRole}
                                            onValueChange={(v) => setChosenRole(v as UserRole)}
                                            disabled={isPending || user.isBanned}
                                        >
                                            <SelectTrigger className="w-full bg-gray-50/50 border-gray-200 cursor-pointer h-11 flex-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="user" className="cursor-pointer py-3">Користувач</SelectItem>
                                                <SelectItem value="volunteer" className="cursor-pointer py-3">Волонтер</SelectItem>
                                                <SelectItem value="shelter" className="cursor-pointer py-3">Притулок</SelectItem>
                                                <SelectItem value="admin" className="cursor-pointer py-3 text-red-600 font-semibold focus:text-red-700">Адміністратор</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Button
                                            onClick={handleSaveRole}
                                            disabled={isPending || !hasRoleChanged || user.isBanned}
                                            className={cn(
                                                "h-11 px-6 font-semibold transition-all shadow-sm cursor-pointer shrink-0 sm:w-auto w-full",
                                                hasRoleChanged && !user.isBanned
                                                    ? "bg-primary text-white hover:bg-primary/90"
                                                    : "bg-gray-100 text-gray-400 border border-gray-200 hover:bg-gray-100"
                                            )}
                                        >
                                            {isUpdatingRole ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            ) : (
                                                <Save className="w-4 h-4 mr-2" />
                                            )}
                                            Оновити роль
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>
                    </div>
                </div>

                <div className="p-6 bg-white border-t border-gray-100 flex items-center gap-3 shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-10">
                    {user.isBanned ? (
                        <Button
                            size="lg"
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm cursor-pointer text-base font-bold"
                            onClick={handleBanToggle}
                            disabled={isPending}
                        >
                            {isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                            Розблокувати доступ
                        </Button>
                    ) : (
                        <Button
                            size="lg"
                            variant="destructive"
                            className="w-full shadow-sm cursor-pointer text-base font-bold"
                            onClick={handleBanToggle}
                            disabled={isPending || user.role === "admin"}
                        >
                            {isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Ban className="w-5 h-5 mr-2" />}
                            Заблокувати назавжди
                        </Button>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
