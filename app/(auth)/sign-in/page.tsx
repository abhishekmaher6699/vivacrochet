import SignInForm from '@/components/auth/signin-form'
import { requireNoAuth } from '@/lib/auth-utils'

const SignInPage = () => {
  requireNoAuth()
  return (
    <div className='flex items-center justify-center w-full h-screen'>
        <SignInForm />
    </div>
  )
}

export default SignInPage