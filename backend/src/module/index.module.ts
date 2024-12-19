import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { IndexController } from "src/controller/index.controller";

@Module({
    imports:[ConfigModule.forRoot({
        isGlobal: true,
    })],
    controllers: [IndexController],
    providers: [],
})

export class IndexModule {};