import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { ParserService } from './parser.service';
import { GameBoardComponent } from './game-board/game-board.component';
import { DrawingService } from './drawing.service';


@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    GameBoardComponent,
  ],
  imports: [
    BrowserModule,
  ],
  providers: [
    ParserService,
    DrawingService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
