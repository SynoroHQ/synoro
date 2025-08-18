import Link from "next/link";
import { Camera, Plus, Receipt, Search, Upload } from "lucide-react";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@synoro/ui";

export default function ReceiptsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Чеки</h1>
          <p className="text-muted-foreground">
            Управление чеками и финансовыми записями
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href="/receipts/upload">
              <Upload className="mr-2 h-4 w-4" />
              Загрузить чек
            </Link>
          </Button>
          <Button asChild>
            <Link href="/receipts/new">
              <Plus className="mr-2 h-4 w-4" />
              Добавить вручную
            </Link>
          </Button>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:bg-accent cursor-pointer transition-colors">
          <CardContent className="p-6 text-center">
            <Camera className="mx-auto mb-3 h-8 w-8 text-blue-600" />
            <h3 className="mb-2 font-medium">Сфотографировать</h3>
            <p className="text-muted-foreground text-sm">
              Сделайте фото чека для автоматической обработки
            </p>
          </CardContent>
        </Card>

        <Card className="hover:bg-accent cursor-pointer transition-colors">
          <CardContent className="p-6 text-center">
            <Upload className="mx-auto mb-3 h-8 w-8 text-green-600" />
            <h3 className="mb-2 font-medium">Загрузить файл</h3>
            <p className="text-muted-foreground text-sm">
              Загрузите изображение чека с устройства
            </p>
          </CardContent>
        </Card>

        <Card className="hover:bg-accent cursor-pointer transition-colors">
          <CardContent className="p-6 text-center">
            <Plus className="mx-auto mb-3 h-8 w-8 text-purple-600" />
            <h3 className="mb-2 font-medium">Ввести вручную</h3>
            <p className="text-muted-foreground text-sm">
              Создайте запись о покупке вручную
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Поиск и фильтры */}
      <Card>
        <CardHeader>
          <CardTitle>Поиск чеков</CardTitle>
          <CardDescription>
            Найдите нужные чеки по магазину, дате или сумме
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
              <input
                type="text"
                placeholder="Поиск по чекам..."
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-10 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <Button variant="outline">Фильтры</Button>
          </div>
        </CardContent>
      </Card>

      {/* Статистика */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего чеков</CardTitle>
            <Receipt className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-muted-foreground text-xs">За все время</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">За месяц</CardTitle>
            <Receipt className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">0</div>
            <p className="text-muted-foreground text-xs">За текущий месяц</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Общая сумма</CardTitle>
            <Receipt className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₽0</div>
            <p className="text-muted-foreground text-xs">За все время</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">За месяц</CardTitle>
            <Receipt className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">₽0</div>
            <p className="text-muted-foreground text-xs">За текущий месяц</p>
          </CardContent>
        </Card>
      </div>

      {/* Список чеков */}
      <Card>
        <CardHeader>
          <CardTitle>Последние чеки</CardTitle>
          <CardDescription>
            Ваши недавно добавленные финансовые записи
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <Receipt className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-medium">Чеков пока нет</h3>
            <p className="text-muted-foreground mb-4">
              Начните добавлять чеки, чтобы отслеживать свои расходы
            </p>
            <div className="flex justify-center space-x-2">
              <Button asChild>
                <Link href="/receipts/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Загрузить чек
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/receipts/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить вручную
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
