import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTutoDTO } from './dto/create-tuto.dto';
import { SocialInterface } from 'src/interfaces/Social.interface';
import detectSocialNetwork from 'detect-social-network';

@Injectable()
export class TutoService {
  social: SocialInterface[];
  constructor(private readonly prisma: PrismaService) {
    this.listSocial();
  }

  async setTutos(id: number, createTuto: CreateTutoDTO): Promise<void> {
    const url = detectSocialNetwork(createTuto.url);
    const socialCompatibility = this.social.find((s) => s.name == url);
    if (!socialCompatibility)
      throw new BadRequestException('Réseau social non compatible');
  }

  private async listSocial(): Promise<void> {
    this.social = await this.prisma.socialNetwork.findMany();
  }
}
