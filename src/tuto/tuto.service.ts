import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTutoDTO } from './dto/create-tuto.dto';
import { SocialInterface } from 'src/interfaces/Social.interface';
import detectSocialNetwork from 'detect-social-network';
import { TutoDTO } from './dto/tuto.dto';

@Injectable()
export class TutoService {
  social: SocialInterface[];
  constructor(private readonly prisma: PrismaService) {
    this.listSocial();
  }

  async getTuto(id: number, idBoard: number): Promise<TutoDTO[]> {
    await this.boardBelongToUser(id, idBoard);

    const tuto: TutoDTO[] = await this.prisma.tuto.findMany({
      where: {
        idBoard: idBoard,
      },
    });
    return tuto;
  }

  async setTutos(id: number, createTuto: CreateTutoDTO): Promise<void> {
    if (!this.isValidUrl(createTuto.url))
      throw new BadRequestException('Pas une URL');

    const url = detectSocialNetwork(createTuto.url);
    const socialCompatibility = this.social.find((s) => s.name == url);

    if (!socialCompatibility)
      throw new BadRequestException('Réseau social non compatible');

    await this.boardBelongToUser(id, createTuto.board);

    await this.prisma.tuto.create({
      data: {
        URL: createTuto.url,
        title: createTuto.title,
        idSocial: socialCompatibility.id,
        idBoard: createTuto.board,
      },
    });
  }

  private async listSocial(): Promise<void> {
    this.social = await this.prisma.socialNetwork.findMany();
  }

  private async boardBelongToUser(
    idUser: number,
    idBoard: number,
  ): Promise<void> {
    const user = await this.prisma.board.findUnique({
      where: {
        id: idBoard,
        idUser: idUser,
      },
      include: {
        user: true,
      },
    });

    if (!user)
      throw new ForbiddenException('Board non existant pour cette utilisateur');
  }

  private isValidUrl(url: string): boolean {
    try {
      return Boolean(new URL(url));
    } catch (error) {
      return false;
    }
  }
}
