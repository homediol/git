<?php

namespace App\Http\Controllers;

use App\Models\Portfolio;
use Illuminate\Http\Request;

class PortfolioController extends Controller
{
    public function index(Request $request)
    {
        $portfolios = Portfolio::all();
        $categories = Portfolio::distinct()->pluck('category');
        
        return view('portfolio', compact('portfolios', 'categories'));
    }
}
