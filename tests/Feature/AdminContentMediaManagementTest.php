<?php

namespace Tests\Feature;

use App\Models\Portfolio;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminContentMediaManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_update_portfolio_card_media_and_translations(): void
    {
        Storage::fake('public');

        $admin = $this->createAdmin();
        $portfolio = Portfolio::create([
            'title' => 'Original title',
            'description' => 'Original description',
            'category' => 'Original category',
            'image' => '',
        ]);

        $video = UploadedFile::fake()->create('portfolio-card.mp4', 2048, 'video/mp4');

        $response = $this->actingAs($admin)->post(route('admin.portfolios.update', $portfolio), [
            '_method' => 'PUT',
            'title' => 'Default portfolio title',
            'title_rw' => 'Umutwe w umushinga',
            'title_en' => 'Portfolio project title',
            'title_fr' => 'Titre du projet',
            'description' => 'Default portfolio description',
            'description_rw' => 'Ibisobanuro by umushinga',
            'description_en' => 'English portfolio description',
            'description_fr' => 'Description francaise du projet',
            'category' => 'Default category',
            'category_rw' => 'Icyiciro',
            'category_en' => 'Category',
            'category_fr' => 'Categorie',
            'image' => $video,
        ]);

        $response->assertRedirect();

        $portfolio->refresh();

        $this->assertSame('Umutwe w umushinga', $portfolio->title_rw);
        $this->assertSame('Portfolio project title', $portfolio->title_en);
        $this->assertSame('Titre du projet', $portfolio->title_fr);
        $this->assertSame('Ibisobanuro by umushinga', $portfolio->description_rw);
        $this->assertSame('English portfolio description', $portfolio->description_en);
        $this->assertSame('Description francaise du projet', $portfolio->description_fr);
        $this->assertSame('Icyiciro', $portfolio->category_rw);
        $this->assertSame('Category', $portfolio->category_en);
        $this->assertSame('Categorie', $portfolio->category_fr);
        $this->assertStringStartsWith('/storage/portfolio/videos/', $portfolio->image);

        Storage::disk('public')->assertExists(str_replace('/storage/', '', $portfolio->image));
    }

    public function test_admin_can_remove_post_media_and_keep_translations_updated(): void
    {
        $admin = $this->createAdmin();
        $post = Post::create([
            'title' => 'Old title',
            'content' => 'Old content',
            'category' => 'Old category',
            'image' => '/storage/posts/images/old-card.jpg',
            'video' => '/storage/posts/videos/old-video.mp4',
        ]);

        $response = $this->actingAs($admin)->post(route('admin.posts.update', $post), [
            '_method' => 'PUT',
            'title' => 'New default title',
            'title_rw' => 'Umutwe mushya',
            'title_en' => 'New english title',
            'title_fr' => 'Nouveau titre',
            'content' => 'New default content',
            'content_rw' => 'Ibirimo bishya',
            'content_en' => 'New english content',
            'content_fr' => 'Nouveau contenu',
            'category' => 'News',
            'category_rw' => 'Amakuru',
            'category_en' => 'News',
            'category_fr' => 'Nouvelles',
            'delete_image' => true,
            'delete_video' => true,
        ]);

        $response->assertRedirect();

        $post->refresh();

        $this->assertNull($post->image);
        $this->assertNull($post->video);
        $this->assertSame('Umutwe mushya', $post->title_rw);
        $this->assertSame('New english title', $post->title_en);
        $this->assertSame('Nouveau titre', $post->title_fr);
        $this->assertSame('Ibirimo bishya', $post->content_rw);
        $this->assertSame('New english content', $post->content_en);
        $this->assertSame('Nouveau contenu', $post->content_fr);
        $this->assertSame('Amakuru', $post->category_rw);
        $this->assertSame('News', $post->category_en);
        $this->assertSame('Nouvelles', $post->category_fr);
    }

    private function createAdmin(): User
    {
        return User::factory()->create([
            'role' => 'admin',
            'language' => 'rw',
        ]);
    }
}
