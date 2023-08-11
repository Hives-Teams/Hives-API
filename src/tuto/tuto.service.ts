import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cache } from 'cache-manager';
import { CreateTutoDTO } from './dto/create-tuto.dto';
import { SocialInterface } from 'src/interfaces/Social.interface';
import socialNetworkDetector from 'src/social-network-detector/socialNetworkDetector';

@Injectable()
export class TutoService {
  social: SocialInterface[];
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.listSocial();
  }

  async setTutos(id: number, createTuto: CreateTutoDTO): Promise<void> {
    const socialTitle = socialNetworkDetector(createTuto.url);
    const socialList: SocialInterface[] = this.social;
    const socialCompatibility = socialList.find((s) => {
      s.name == socialTitle;
    });
    if (!socialCompatibility)
      throw new BadRequestException('Réseau social non compatible');
    console.log('compatible');
  }

  private async listSocial(): Promise<void> {
    const social = await this.prisma.socialNetwork.findMany();
    this.social = social;
    // await this.cacheManager.set('social', JSON.stringify(social), 0);
  }
}
