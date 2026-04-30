from flask import Blueprint, request, jsonify
from app import db
from app.models import User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Vérifier si l'email existe déjà
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email déjà utilisé'}), 400
    
    # Créer le nouvel utilisateur
    nouvel_user = User(
        nom=data['nom'],
        email=data['email'],
        mot_de_passe=generate_password_hash(data['mot_de_passe'])
    )
    
    db.session.add(nouvel_user)
    db.session.commit()
    
    return jsonify({'message': 'Compte créé avec succès !'}), 201
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Chercher l'utilisateur par email
    user = User.query.filter_by(email=data['email']).first()
    
    # Vérifier si l'utilisateur existe et le mot de passe est correct
    if not user or not check_password_hash(user.mot_de_passe, data['mot_de_passe']):
        return jsonify({'message': 'Email ou mot de passe incorrect'}), 401
    
    # Créer le token JWT
    token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'nom': user.nom,
            'email': user.email
        }
    }), 200